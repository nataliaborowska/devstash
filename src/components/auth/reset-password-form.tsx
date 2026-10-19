"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword } from "@/actions/auth";
import { FormField } from "@/components/auth/form-field";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  return (
    <div className="space-y-5">
      {state?.error && (
        <FormMessage variant="error">
          {state.error}
          {state.invalidToken && (
            <>
              {" "}
              <Link href="/forgot-password" className="font-medium underline">
                Request a new link
              </Link>
            </>
          )}
        </FormMessage>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <FormField id="password" label="New password" type="password" autoComplete="new-password" required />
        <FormField
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
        />
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
