import { auth } from "@/auth";

const PROTECTED_PREFIXES = ["/dashboard", "/profile"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  if (!req.auth && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
