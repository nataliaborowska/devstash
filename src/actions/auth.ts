"use server";

import bcrypt from "bcryptjs";
import { AuthError, CredentialsSignin } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { EMAIL_NOT_VERIFIED_CODE } from "@/lib/auth-errors";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getClientIp, getRateLimitMessage, rateLimit, type RateLimitName } from "@/lib/rate-limit";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";
import { consumePasswordResetToken, createPasswordResetToken } from "@/lib/verification-token";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema } from "@/lib/validations/auth";

export interface SignInResult {
  success: boolean;
  email?: string;
  error?: string;
  rateLimited?: boolean;
}

/** Returns the error message when the client is over the limit, otherwise null. */
async function checkRateLimit(name: RateLimitName, email?: string): Promise<string | null> {
  const ip = getClientIp(await headers());
  const { success, reset } = await rateLimit(name, email ? `${ip}:${email}` : ip);
  return success ? null : getRateLimitMessage(reset);
}

function getSignInErrorMessage(error: AuthError): string {
  if (error instanceof CredentialsSignin) {
    return error.code === EMAIL_NOT_VERIFIED_CODE
      ? "Please verify your email before signing in. Check your inbox for the verification link."
      : "Invalid email or password";
  }
  return "Something went wrong. Please try again.";
}

export async function signInWithCredentials(
  _prevState: SignInResult | null,
  formData: FormData
): Promise<SignInResult> {
  const email = formData.get("email");
  const parsed = signInSchema.safeParse({ email, password: formData.get("password") });
  const submittedEmail = typeof email === "string" ? email : undefined;

  if (!parsed.success) {
    return {
      success: false,
      email: submittedEmail,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const rateLimitError = await checkRateLimit("login", parsed.data.email);
  if (rateLimitError) {
    return { success: false, email: submittedEmail, error: rateLimitError, rateLimited: true };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")),
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, email: submittedEmail, error: getSignInErrorMessage(error) };
    }
    throw error;
  }
}

export async function signInWithGitHub(formData: FormData) {
  await signIn("github", { redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")) });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}

export interface ForgotPasswordResult {
  success: boolean;
  email?: string;
  error?: string;
  rateLimited?: boolean;
}

export interface ResetPasswordResult {
  success: boolean;
  error?: string;
  invalidToken?: boolean;
  rateLimited?: boolean;
}

async function getAppUrl(): Promise<string> {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  // Request headers are client-controlled, so they're only trusted for local development.
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_URL must be set to send password reset emails");
  }
  const host = (await headers()).get("host");
  return `http://${host}`;
}

async function sendPasswordReset(email: string): Promise<void> {
  const token = await createPasswordResetToken(email);
  const resetUrl = new URL("/reset-password", await getAppUrl());
  resetUrl.searchParams.set("token", token);
  await sendPasswordResetEmail(email, resetUrl.toString());
}

export async function requestPasswordReset(
  _prevState: ForgotPasswordResult | null,
  formData: FormData
): Promise<ForgotPasswordResult> {
  const email = formData.get("email");
  const parsed = forgotPasswordSchema.safeParse({ email });
  const submittedEmail = typeof email === "string" ? email : undefined;

  if (!parsed.success) {
    return {
      success: false,
      email: submittedEmail,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const rateLimitError = await checkRateLimit("forgotPassword");
  if (rateLimitError) {
    return { success: false, email: submittedEmail, error: rateLimitError, rateLimited: true };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { password: true },
    });
    if (user?.password) await sendPasswordReset(parsed.data.email);
  } catch (error) {
    // Logged only: an error response here would reveal that the account exists.
    console.error(error);
  }

  return { success: true, email: submittedEmail };
}

export async function resetPassword(
  _prevState: ResetPasswordResult | null,
  formData: FormData
): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const rateLimitError = await checkRateLimit("resetPassword");
  if (rateLimitError) {
    return { success: false, error: rateLimitError, rateLimited: true };
  }

  try {
    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const reset = await consumePasswordResetToken(parsed.data.token, hashedPassword);
    if (!reset) {
      return { success: false, invalidToken: true, error: "This reset link is invalid or has expired." };
    }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  redirect("/sign-in?reset=1");
}
