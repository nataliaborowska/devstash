import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

/** Reset tokens share the VerificationToken table, so their identifier is namespaced to keep the two flows apart. */
const PASSWORD_RESET_PREFIX = "password-reset:";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Replaces any existing tokens for the identifier and returns the raw token (only its hash is stored). */
async function createToken(identifier: string, ttlMs: number): Promise<string> {
  const token = randomBytes(32).toString("hex");

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({
      data: { identifier, token: hashToken(token), expires: new Date(Date.now() + ttlMs) },
    }),
  ]);

  return token;
}

export function createVerificationToken(email: string): Promise<string> {
  return createToken(email, TOKEN_TTL_MS);
}

/** Marks the user's email as verified if the token is valid. Returns whether verification succeeded. */
export async function consumeVerificationToken(token: string): Promise<boolean> {
  const record = await prisma.verificationToken.findFirst({
    where: { token: hashToken(token), NOT: { identifier: { startsWith: PASSWORD_RESET_PREFIX } } },
  });
  if (!record) return false;

  await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
  if (record.expires < new Date()) return false;

  const { count } = await prisma.user.updateMany({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });
  return count > 0;
}

export function createPasswordResetToken(email: string): Promise<string> {
  return createToken(`${PASSWORD_RESET_PREFIX}${email}`, PASSWORD_RESET_TTL_MS);
}

/** Returns whether the password reset token exists and has not expired. */
export async function isPasswordResetTokenValid(token: string): Promise<boolean> {
  const record = await prisma.verificationToken.findFirst({
    where: {
      token: hashToken(token),
      identifier: { startsWith: PASSWORD_RESET_PREFIX },
      expires: { gt: new Date() },
    },
  });
  return record !== null;
}

/** Sets the user's password if the reset token is valid, then deletes the token. Returns whether the reset succeeded. */
export async function consumePasswordResetToken(token: string, hashedPassword: string): Promise<boolean> {
  const record = await prisma.verificationToken.findFirst({
    where: { token: hashToken(token), identifier: { startsWith: PASSWORD_RESET_PREFIX } },
  });
  if (!record) return false;

  const email = record.identifier.slice(PASSWORD_RESET_PREFIX.length);

  return prisma.$transaction(async (tx) => {
    const deleted = await tx.verificationToken.deleteMany({
      where: { identifier: record.identifier, token: record.token },
    });
    if (deleted.count === 0 || record.expires < new Date()) return false;

    const { count } = await tx.user.updateMany({ where: { email }, data: { password: hashedPassword } });
    await tx.user.updateMany({ where: { email, emailVerified: null }, data: { emailVerified: new Date() } });
    return count > 0;
  });
}
