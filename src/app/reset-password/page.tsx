import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { isPasswordResetTokenValid } from "@/lib/verification-token";

interface ResetPasswordPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;
  const isValid = token ? await isPasswordResetTokenValid(token) : false;

  if (!token || !isValid) {
    return (
      <AuthCard title="Reset link expired" description="This link can't be used to reset your password.">
        <div className="space-y-5">
          <FormMessage variant="error">This reset link is invalid or has expired.</FormMessage>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="font-medium text-foreground hover:underline">
              Request a new reset link
            </Link>
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" description="Enter a new password for your DevStash account.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
