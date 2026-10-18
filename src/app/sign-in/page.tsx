import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method.",
  AccessDenied: "Access denied.",
  InvalidVerificationLink: "This verification link is invalid or has expired.",
};

interface SignInPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);

  const session = await auth();
  if (session?.user) redirect(callbackUrl);

  const errorCode = typeof params.error === "string" ? params.error : undefined;
  const initialError = errorCode
    ? (AUTH_ERROR_MESSAGES[errorCode] ?? "Sign in failed. Please try again.")
    : undefined;
  const initialSuccess =
    params.verified === "1" ? "Your email is verified. You can now sign in." : undefined;

  return (
    <AuthCard title="Sign in to DevStash" description="Welcome back. Pick up where you left off.">
      <SignInForm callbackUrl={callbackUrl} initialError={initialError} initialSuccess={initialSuccess} />
    </AuthCard>
  );
}
