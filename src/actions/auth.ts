"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/auth";
import { EMAIL_NOT_VERIFIED_CODE } from "@/lib/auth-errors";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";
import { signInSchema } from "@/lib/validations/auth";

export interface SignInResult {
  success: boolean;
  email?: string;
  error?: string;
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
