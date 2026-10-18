"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import { FormField } from "@/components/auth/form-field";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

type FieldErrors = Partial<Record<keyof RegisterInput, string>>;

interface RegisterResponse {
  success: boolean;
  error?: string;
}

function getFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof RegisterInput;
    fieldErrors[field] ??= issue.message;
  }
  return fieldErrors;
}

async function submitRegistration(values: RegisterInput): Promise<RegisterResponse> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    return (await response.json()) as RegisterResponse;
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export function RegisterForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const values = Object.fromEntries(new FormData(event.currentTarget)) as RegisterInput;
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    const result = await submitRegistration(values);
    if (!result.success) {
      setFormError(result.error ?? "Registration failed. Please try again.");
      setIsSubmitting(false);
      return;
    }
    toast.success("Check your inbox", {
      description: `We sent a verification link to ${parsed.data.email}. Verify your email before signing in.`,
    });
    router.push("/sign-in");
  }

  return (
    <div className="space-y-5">
      {formError && <FormMessage variant="error">{formError}</FormMessage>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="name" label="Name" autoComplete="name" error={fieldErrors.name} />
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={fieldErrors.email}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={fieldErrors.password}
        />
        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
