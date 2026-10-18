/**
 * Email verification on register (requires a Resend domain to reach any address).
 * Opt-in: enabled only when EMAIL_VERIFICATION_ENABLED is exactly "true".
 */
export function isEmailVerificationEnabled(): boolean {
  return process.env.EMAIL_VERIFICATION_ENABLED === "true";
}
