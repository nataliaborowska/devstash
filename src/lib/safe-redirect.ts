export const DEFAULT_SIGN_IN_REDIRECT = "/dashboard";

export function getSafeCallbackUrl(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_SIGN_IN_REDIRECT;
  }
  return value;
}
