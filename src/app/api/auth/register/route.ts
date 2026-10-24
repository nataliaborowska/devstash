import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import { isEmailVerificationEnabled } from "@/lib/feature-flags";
import { prisma } from "@/lib/prisma";
import { getClientIp, getRateLimitMessage, getRetryAfterSeconds, rateLimit } from "@/lib/rate-limit";
import { createVerificationToken } from "@/lib/verification-token";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const limit = await rateLimit("register", getClientIp(request.headers));
  if (!limit.success) {
    return NextResponse.json(
      { success: false, error: getRateLimitMessage(limit.reset) },
      { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(limit.reset)) } }
    );
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { success: false, error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const verificationRequired = isEmailVerificationEnabled();

  if (verificationRequired) {
    try {
      await sendVerification(email, request.url);
    } catch (error) {
      console.error(error);
      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { success: false, error: "We couldn't send the verification email. Please try again." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, verificationRequired },
  });
}

async function sendVerification(email: string, requestUrl: string): Promise<void> {
  const token = await createVerificationToken(email);
  const verifyUrl = new URL("/api/auth/verify-email", process.env.AUTH_URL ?? requestUrl);
  verifyUrl.searchParams.set("token", token);
  await sendVerificationEmail(email, verifyUrl.toString());
}
