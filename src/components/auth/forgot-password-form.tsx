"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { FormField } from "@/components/auth/form-field";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null);

  return (
    <div className="space-y-5">
      {state?.error && <FormMessage variant="error">{state.error}</FormMessage>}
      {state?.success && (
        <FormMessage variant="success">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </FormMessage>
      )}

      <form action={formAction} className="space-y-4">
        {/* Keyed so a new submitted email remounts the uncontrolled input instead of changing its defaultValue. */}
        <FormField
          key={state?.email ?? ""}
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state?.email}
          required
        />
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-medium text-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
