"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithCredentials, signInWithGitHub } from "@/actions/auth";
import { FormField } from "@/components/auth/form-field";
import { FormMessage } from "@/components/auth/form-message";
import { GitHubIcon } from "@/components/auth/github-icon";
import { Button } from "@/components/ui/button";

interface SignInFormProps {
  callbackUrl: string;
  initialError?: string;
  initialSuccess?: string;
}

export function SignInForm({ callbackUrl, initialError, initialSuccess }: SignInFormProps) {
  const [state, formAction, isPending] = useActionState(signInWithCredentials, null);
  const error = state ? state.error : initialError;
  const success = state ? undefined : initialSuccess;

  return (
    <div className="space-y-5">
      {error && <FormMessage variant="error">{error}</FormMessage>}
      {success && <FormMessage variant="success">{success}</FormMessage>}

      <form action={signInWithGitHub}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <Button type="submit" variant="outline" size="lg" className="w-full">
          <GitHubIcon className="size-4" />
          Sign in with GitHub
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state?.email}
          required
        />
        <div className="space-y-1.5">
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-foreground hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
