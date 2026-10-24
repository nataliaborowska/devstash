"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations/auth";

export interface ProfileActionResult {
  success: boolean;
  error?: string;
}

export async function changePassword(
  _prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in" };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let email: string;
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, password: true },
    });
    if (!user?.password) {
      return { success: false, error: "Password sign-in is not enabled for this account" };
    }

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!isValid) return { success: false, error: "Current password is incorrect" };

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword, passwordChangedAt: new Date() },
    });
    email = user.email;
  } catch (error) {
    console.error(error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // The password change signed out every session, this one included; re-issue it so the user stays signed in.
  try {
    await signIn("credentials", { email, password: parsed.data.password, redirect: false });
  } catch (error) {
    if (!(error instanceof AuthError)) throw error;
    console.error(error);
    redirect("/sign-in?reset=1");
  }
  return { success: true };
}

export async function deleteAccount(): Promise<ProfileActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in" };
  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { email: true } });
      if (!user) return;

      // Items go first: Item.typeId is ON DELETE RESTRICT, so cascading custom item types could fail.
      await tx.item.deleteMany({ where: { userId } });
      await tx.verificationToken.deleteMany({
        where: { identifier: { in: [user.email, `password-reset:${user.email}`] } },
      });
      await tx.user.delete({ where: { id: userId } });
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not delete your account. Please try again." };
  }

  await signOut({ redirectTo: "/sign-in" });
  return { success: true };
}
