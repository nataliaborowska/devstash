import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { EmailNotVerifiedError } from "@/lib/auth-errors";
import { isEmailVerificationEnabled } from "@/lib/feature-flags";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";

/** The user's password-change time as a JWT-friendly value, or `undefined` if the user no longer exists. */
async function getPasswordChangedAt(userId: string): Promise<number | null | undefined> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordChangedAt: true } });
  if (!user) return undefined;
  return user.passwordChangedAt?.getTime() ?? null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // JWTs can't be revoked, so each token records the password-change time it was issued under and
    // is rejected once that changes — a password reset or change signs out every other session.
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.passwordChangedAt = (await getPasswordChangedAt(user.id)) ?? null;
        return token;
      }
      if (typeof token.id !== "string") return token;

      const passwordChangedAt = await getPasswordChangedAt(token.id);
      if (passwordChangedAt === undefined || passwordChangedAt !== (token.passwordChangedAt ?? null)) {
        return null;
      }
      return token;
    },
  },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        });
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        if (isEmailVerificationEnabled() && !user.emailVerified) throw new EmailNotVerifiedError();

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
});
