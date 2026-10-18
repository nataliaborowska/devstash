import { NextResponse, type NextRequest } from "next/server";
import { consumeVerificationToken } from "@/lib/verification-token";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const verified = token ? await consumeVerificationToken(token) : false;

  const signInUrl = new URL("/sign-in", request.nextUrl.origin);
  if (verified) {
    signInUrl.searchParams.set("verified", "1");
  } else {
    signInUrl.searchParams.set("error", "InvalidVerificationLink");
  }
  return NextResponse.redirect(signInUrl);
}
