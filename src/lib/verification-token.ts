import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Replaces any existing tokens for the email and returns the raw token (only its hash is stored). */
export async function createVerificationToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: email } }),
    prisma.verificationToken.create({
      data: { identifier: email, token: hashToken(token), expires: new Date(Date.now() + TOKEN_TTL_MS) },
    }),
  ]);

  return token;
}

/** Marks the user's email as verified if the token is valid. Returns whether verification succeeded. */
export async function consumeVerificationToken(token: string): Promise<boolean> {
  const record = await prisma.verificationToken.findFirst({ where: { token: hashToken(token) } });
  if (!record) return false;

  await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
  if (record.expires < new Date()) return false;

  const { count } = await prisma.user.updateMany({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });
  return count > 0;
}
