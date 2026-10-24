import { z } from "zod";

const emailField = z.email("Invalid email address").transform((email) => email.trim().toLowerCase());
const newPasswordField = z.string().min(8, "Password must be at least 8 characters");

function passwordsMatch(data: { password: string; confirmPassword: string }): boolean {
  return data.password === data.confirmPassword;
}

const passwordsMatchError = { message: "Passwords do not match", path: ["confirmPassword"] };

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: emailField,
    password: newPasswordField,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, passwordsMatchError);

export type RegisterInput = z.input<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is missing"),
    password: newPasswordField,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, passwordsMatchError);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: newPasswordField,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, passwordsMatchError);
