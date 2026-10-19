import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { DEFAULT_SIGN_IN_REDIRECT } from "@/lib/safe-redirect";

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user) redirect(DEFAULT_SIGN_IN_REDIRECT);

  return (
    <AuthCard title="Forgot your password?" description="Enter your email and we'll send you a reset link.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
