import type { NextRequest } from "next/server";
import { handlers } from "@/auth";

export const { GET } = handlers;

const CREDENTIALS_CALLBACK_PATH = "/api/auth/callback/credentials";

// Credentials sign-in must go through the rate-limited signInWithCredentials action, which calls
// NextAuth directly rather than over HTTP, so the public callback would only bypass that limit.
export function POST(request: NextRequest) {
  if (request.nextUrl.pathname.replace(/\/+$/, "") === CREDENTIALS_CALLBACK_PATH) {
    return new Response(null, { status: 404 });
  }
  return handlers.POST(request);
}
