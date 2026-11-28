import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { DEFAULT_SIGN_IN_REDIRECT } from "@/lib/safe-redirect";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect(DEFAULT_SIGN_IN_REDIRECT);

  return (
    <AuthPageShell>
      <AuthCard title="Create your account" description="Start stashing your snippets, prompts and more.">
        <RegisterForm />
      </AuthCard>
    </AuthPageShell>
  );
}
