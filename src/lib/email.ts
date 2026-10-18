import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM ?? "DevStash <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, verifyUrl: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Verify your DevStash email",
    text: `Welcome to DevStash! Confirm your email address by opening this link:\n\n${verifyUrl}\n\nThe link expires in 24 hours. If you didn't create an account, you can ignore this email.`,
    html: `
      <p>Welcome to DevStash!</p>
      <p>Confirm your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify email</a></p>
      <p>The link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    `,
  });

  if (error) throw new Error(`Failed to send verification email: ${error.message}`);
}
