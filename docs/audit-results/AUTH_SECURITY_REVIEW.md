# Authentication Security Audit

**Last Audit Date**: 2026-10-20
**Auditor**: Auth Security Agent

## Executive Summary

The custom auth code is well built. Tokens come from a secure random source, only their SHA-256 hashes are stored, they expire, and a token can be used only once. Password reset runs inside a transaction. Sensitive actions take the user ID from the session, changing a password requires the current one, and redirects are checked. The real gaps are not in the code that exists but in what is missing: nothing is rate-limited, and JWT sessions stay valid after a password reset or change. With email verification turned off in production, anyone can also register an account under someone else's email address.

## Findings

### Critical Issues

None found.

### High Severity

#### No rate limiting on any auth endpoint

**Severity**: High
**File**: `src/auth.ts`, `src/app/api/auth/register/route.ts`, `src/actions/auth.ts`, `src/actions/profile.ts`
**Line(s)**: `auth.ts` 22-39, `register/route.ts` 9-62, `actions/auth.ts` 97-125, `actions/profile.ts` 13-48

**Vulnerable Code**:
```typescript
// src/auth.ts: every call runs straight through to bcrypt.compare
async authorize(credentials) {
  ...
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;
```

**Problem**: Nothing in the codebase limits how often these can be called: credentials sign-in, `POST /api/auth/register`, `requestPasswordReset` and `changePassword`. There is no rate-limiting library and no lockout counter. NextAuth does not rate-limit the Credentials provider itself.

**Attack Scenario**:
- **Login brute force / credential stuffing:** an attacker sends unlimited password guesses for a known email. The only friction is bcrypt cost 12 (about 250 ms per guess per request), and many requests can run in parallel.
- **Email bombing:** an attacker calls `requestPasswordReset` in a loop for a victim's address. Each call sends a real email through Resend, which floods the victim's inbox and uses up the Resend quota and sender reputation.
- **Registration spam:** an attacker scripts registrations that fill the `User` table. When verification is turned on, each one also sends an email.
- **CPU exhaustion:** every login and registration runs a bcrypt hash at cost 12, so a flood of requests ties up server CPU.

**Fix**: Add an IP-and-identifier limiter (for example `@upstash/ratelimit` with Upstash Redis, which works in serverless) and call it at the start of each entry point:

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const redis = Redis.fromEnv();

export const limiters = {
  login: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "15 m"), prefix: "rl:login" }),
  register: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "rl:register" }),
  passwordReset: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "rl:reset" }),
  changePassword: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "15 m"), prefix: "rl:change-pw" }),
};

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
```

```typescript
// src/actions/auth.ts: signInWithCredentials, before signIn()
const ip = await getClientIp();
const { success } = await limiters.login.limit(`${ip}:${parsed.data.email}`);
if (!success) {
  return { success: false, email: submittedEmail, error: "Too many attempts. Please try again later." };
}

// src/actions/auth.ts: requestPasswordReset, key on the email so one victim can't be bombed
const { success } = await limiters.passwordReset.limit(parsed.data.email);
if (!success) return { success: true, email: submittedEmail }; // same response, no enumeration
```

Also apply `limiters.register` (keyed by IP) in `register/route.ts` and return status 429, and apply `limiters.changePassword` (keyed by `session.user.id`) in `changePassword`. `authorize()` in `src/auth.ts` is reachable directly through `POST /api/auth/callback/credentials`, not only through the server action. Put the login limiter inside `authorize()` as well (it receives `request` as its second argument), or put it in both places.

---

#### Sessions are not invalidated after a password reset or change

> **Status: Fixed (2026-10-20).** `User.passwordChangedAt` is set on reset and change. The `jwt` callback in `src/auth.ts` rejects any token whose saved timestamp doesn't match the database, and rejects tokens for deleted users. `changePassword` signs the current session in again.

**Severity**: High
**File**: `src/auth.ts`, `src/auth.config.ts`, `src/lib/verification-token.ts`, `src/actions/profile.ts`
**Line(s)**: `auth.ts` 13, `auth.config.ts` 24-31, `verification-token.ts` 80, `profile.ts` 41-42

**Vulnerable Code**:
```typescript
// src/auth.ts
session: { strategy: "jwt" },

// src/auth.config.ts: the token is never checked against the database again
jwt({ token, user }) {
  if (user) token.id = user.id;
  return token;
},
```

**Problem**: The app uses JWT sessions, which NextAuth gives a default lifetime of 30 days, and nothing ties the token to the current password. `consumePasswordResetToken` and `changePassword` change the password hash, but every JWT already issued stays valid until it expires. A password reset is the main way a user recovers a compromised account, and right now it does not sign the attacker out.

**Attack Scenario**: An attacker gets the victim's password (for example a reused password from another breach) and signs in. The victim notices and resets their password. The attacker's session cookie keeps working for up to 30 days, with full access to the dashboard and to the profile actions, including `deleteAccount`.

**Fix**: Store a password timestamp in the JWT at sign-in and reject tokens issued before the latest password change. Do the check in `src/auth.ts`, not in `auth.config.ts`, because it needs Prisma:

```prisma
// prisma/schema.prisma: model User
passwordChangedAt DateTime?
```

```typescript
// Set it wherever the password hash changes:
// verification-token.ts consumePasswordResetToken and profile.ts changePassword
data: { password: hashedPassword, passwordChangedAt: new Date() }
```

```typescript
// src/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.iat = Math.floor(Date.now() / 1000);
        return token;
      }
      if (!token.id) return token;
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: { passwordChangedAt: true },
      });
      // User deleted, or password changed after this token was issued: end the session
      if (!dbUser) return null;
      if (dbUser.passwordChangedAt && token.iat && dbUser.passwordChangedAt.getTime() / 1000 > token.iat) {
        return null;
      }
      return token;
    },
  },
  providers: [ /* unchanged */ ],
});
```

This adds one indexed lookup to each session check. If that is too costly, run the check only every few minutes by storing a `checkedAt` value in the token. After `changePassword` succeeds, sign the user in again (or call `unstable_update`) so their own session is not ended along with the others.

### Medium Severity

#### Email verification is disabled in production, so anyone can register an account under someone else's email

**Severity**: Medium
**File**: `src/lib/feature-flags.ts`, `.env.production`
**Line(s)**: `feature-flags.ts` 5-7

**Vulnerable Code**:
```typescript
// .env.production
EMAIL_VERIFICATION_ENABLED=false

// src/lib/feature-flags.ts
export function isEmailVerificationEnabled(): boolean {
  return process.env.EMAIL_VERIFICATION_ENABLED === "true";
}
```

**Problem**: With the flag off, `POST /api/auth/register` creates a password account for any email address, and that account can sign in straight away. Nobody has to prove they own the address.

**Attack Scenario**: An attacker registers `victim@company.com` before the real owner does. Later the victim tries "Sign in with GitHub" and gets `OAuthAccountNotLinked`, so they are locked out of their own email address on DevStash. The victim can get the account back with a password reset (the reset link goes to the real inbox). Until the session finding above is fixed, though, the attacker's existing session survives that reset. The attacker can also send password-reset emails to any address they have registered this way.

**Fix**: Turn verification on in production once a Resend sending domain is set up (`EMAIL_VERIFICATION_ENABLED=true` and `EMAIL_FROM` on a verified domain). The verification flow itself is correctly implemented, so this only needs configuration. If verification has to stay off for now, fix the session finding above first so that a reset fully reclaims the account.

---

#### Registration endpoint reveals which emails have accounts

**Severity**: Medium
**File**: `src/app/api/auth/register/route.ts`
**Line(s)**: 28-34

**Vulnerable Code**:
```typescript
const existingUser = await prisma.user.findUnique({ where: { email } });
if (existingUser) {
  return NextResponse.json(
    { success: false, error: "A user with this email already exists" },
    { status: 409 }
  );
}
```

**Problem**: The forgot-password flow carefully hides whether an account exists (`actions/auth.ts` 113-124), but registration states it directly with a distinct status code. With no rate limiting, this works as a bulk oracle for which emails have accounts.

**Attack Scenario**: An attacker posts a list of emails to `/api/auth/register` with a throwaway password and collects every email that gets a 409. That list feeds targeted phishing or credential stuffing against the login, which also has no rate limit.

**Fix**: Many products accept this trade-off for usability. If you want the hidden behaviour, return the same success response whether or not the account exists, and email the existing owner instead:

```typescript
if (existingUser) {
  // Tell the real owner, not the requester
  await sendAccountExistsEmail(email).catch(console.error);
  return NextResponse.json({ success: true, data: { verificationRequired: true } });
}
```

At minimum, the registration rate limiter from the High finding limits how fast this can be abused.

### Low Severity

#### Response timing reveals which emails have accounts (login and forgot-password)

**Severity**: Low
**File**: `src/auth.ts`, `src/actions/auth.ts`
**Line(s)**: `auth.ts` 29-35, `actions/auth.ts` 114-118

**Vulnerable Code**:
```typescript
// src/auth.ts: unknown email returns immediately, known email pays for bcrypt (~250 ms)
const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
if (!user?.password) return null;
const isValid = await bcrypt.compare(password, user.password);

// src/actions/auth.ts: known email waits for the token write + Resend API call
if (user?.password) await sendPasswordReset(parsed.data.email);
```

**Problem**: Both flows return the same message for existing and unknown emails, but they take noticeably different amounts of time. For an unknown email, login skips bcrypt entirely, and forgot-password skips a database transaction and an outbound HTTP call.

**Attack Scenario**: An attacker measures response times and sorts emails into "has an account" and "doesn't" without ever seeing a different error message.

**Fix**:
```typescript
// src/auth.ts: always run a compare
// Same cost factor as real hashes so the timing matches
const DUMMY_HASH = bcrypt.hashSync("timing-equaliser-not-a-real-password", 12);
const isValid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
if (!user?.password || !isValid) return null;
```

```typescript
// src/actions/auth.ts: send the email without blocking the response
import { after } from "next/server";

if (user?.password) after(() => sendPasswordReset(parsed.data.email).catch(console.error));
```

---

#### Passwords over 72 bytes are silently truncated

**Severity**: Low
**File**: `src/lib/validations/auth.ts`
**Line(s)**: 4

**Vulnerable Code**:
```typescript
const newPasswordField = z.string().min(8, "Password must be at least 8 characters");
```

**Problem**: bcrypt (and bcryptjs 3.0.3, which this project uses) only uses the first 72 bytes of a password. There is no maximum length, so a user who sets a long passphrase is actually protected only by its first 72 bytes, and any string with the same 72-byte prefix also works. Multi-byte characters (emoji, accented text) reach the limit with fewer characters.

**Attack Scenario**: A user sets a 100-character password that begins with a common 72-byte phrase. Anyone who guesses that prefix can sign in. It is unlikely, but it weakens the guarantee the user thinks they have.

**Fix**:
```typescript
const newPasswordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((p) => new TextEncoder().encode(p).length <= 72, "Password must be at most 72 bytes");
```

---

#### Verification link built from the request URL when `AUTH_URL` is unset

**Severity**: Low
**File**: `src/app/api/auth/register/route.ts`
**Line(s)**: 66

**Vulnerable Code**:
```typescript
const verifyUrl = new URL("/api/auth/verify-email", process.env.AUTH_URL ?? requestUrl);
```

**Problem**: `requestUrl` is derived from the incoming `Host` header. The password-reset path (`getAppUrl` in `actions/auth.ts` 80-88) deliberately refuses to trust that header in production, but the verification path still falls back to it. `AUTH_URL` is not set in `.env` or `.env.production` (it may be set on the hosting platform).

**Attack Scenario**: On a self-hosted deployment that passes `Host` through, an attacker registers the victim's email with `Host: attacker.example`. The victim gets a real DevStash email whose link points to the attacker's domain. If the victim clicks it, the attacker receives the token and can verify the account the attacker created. This only applies when verification is enabled.

**Fix**: Use the same helper as the reset flow:

```typescript
// Move getAppUrl() from src/actions/auth.ts to src/lib/app-url.ts and reuse it
const verifyUrl = new URL("/api/auth/verify-email", await getAppUrl());
```

Note: in production, `getAppUrl()` throws when `AUTH_URL` is missing. If `AUTH_URL` isn't set on the host, password-reset emails are currently failing silently in production, because the error is only logged. Make sure `AUTH_URL` is set.

## Passed Checks

- Password hashing uses bcrypt with cost 12 on every path that writes a password (register, reset, change).
- Password comparison uses `bcrypt.compare` (constant-time); there is no plaintext comparison anywhere.
- Passwords and hashes are never logged, never put in the JWT (only `id` is), and never sent to the client. `getProfileUser` removes the hash and returns only `hasPassword`.
- Verification and reset tokens come from `crypto.randomBytes(32)` (256 bits of entropy).
- Only SHA-256 hashes of tokens are stored, so a database leak does not expose usable links.
- Creating a new token deletes any older tokens for the same identifier, so only one is ever active.
- Reset tokens expire after 1 hour and verification tokens after 24 hours. Expiry is enforced on the server when the token is used, not only when the page is shown.
- A reset token can be used only once, atomically: `deleteMany` count check inside `$transaction`, so two concurrent submissions can't both succeed.
- Verification tokens are deleted before the expiry check, so expired tokens are also cleaned up.
- Reset and verification tokens are namespaced (`password-reset:` prefix), so one kind can't be used in the other flow.
- Forgot-password returns the same response whether or not the account exists, and its errors are only logged.
- The "email not verified" message only appears after a correct password, so it doesn't reveal which emails have accounts.
- `changePassword` requires the current password and uses `session.user.id`, never a user ID from the input.
- `deleteAccount` uses the session's user ID and runs in a transaction that removes items and both kinds of token. `Account` and `Session` rows cascade through the schema.
- Callback URLs are checked by `getSafeCallbackUrl`, which rejects `//` and `/\` open-redirect tricks.
- `getAppUrl` refuses to build reset links from the `Host` header in production.
- All input is validated with Zod; email addresses are normalised (trimmed and lowercased) at sign-in, registration and reset.
- All database access goes through Prisma, with no raw SQL in auth code.
- Error responses are generic; no stack traces or internal details reach the client.
- Protected routes are checked twice: in `proxy.ts` and with `auth()` in the dashboard layout and profile page.

## Recommendations Summary

1. **Add rate limiting** to credentials sign-in (in both `authorize()` and the server action), password-reset requests (keyed by email), registration (keyed by IP) and change-password (keyed by user).
2. **End existing sessions when the password changes**: add a `passwordChangedAt` field and check it in the `jwt` callback.
3. **Turn on email verification in production** once a Resend sending domain is configured.
4. **Make sure `AUTH_URL` is set in production**, and use `getAppUrl()` for verification links as well.
5. **Decide whether registration should hide which emails have accounts**; if so, return the same response and email the existing owner.
6. **Even out response timing**: compare against a dummy bcrypt hash for unknown emails, and send reset emails with `after()`.
7. **Limit new passwords to 72 bytes.**
