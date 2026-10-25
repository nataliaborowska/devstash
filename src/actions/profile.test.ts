import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { changePassword } from "@/actions/profile";

// Server actions are tested with their framework and database dependencies mocked.
vi.mock("@/auth", () => ({ auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn(), update: vi.fn() } },
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));
vi.mock("bcryptjs", () => ({ default: { compare: vi.fn(), hash: vi.fn() } }));

const mockAuth = vi.mocked(auth as unknown as () => Promise<{ user: { id: string } } | null>);
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockUpdate = vi.mocked(prisma.user.update);
const mockCompare = vi.mocked(bcrypt.compare as (data: string, hash: string) => Promise<boolean>);
const mockHash = vi.mocked(bcrypt.hash as (data: string, rounds: number) => Promise<string>);

function buildFormData(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

const validForm = { currentPassword: "old-password", password: "new-password", confirmPassword: "new-password" };

describe("changePassword", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("requires a signed-in user", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await changePassword(null, buildFormData(validForm));
    expect(result).toEqual({ success: false, error: "You must be signed in" });
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns the first validation error", async () => {
    const result = await changePassword(null, buildFormData({ ...validForm, confirmPassword: "nope" }));
    expect(result).toEqual({ success: false, error: "Passwords do not match" });
  });

  it("rejects an incorrect current password", async () => {
    mockFindUnique.mockResolvedValue({ email: "ada@example.com", password: "hash" } as never);
    mockCompare.mockResolvedValue(false);

    const result = await changePassword(null, buildFormData(validForm));

    expect(result).toEqual({ success: false, error: "Current password is incorrect" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("stores the new hashed password and re-signs the user in", async () => {
    mockFindUnique.mockResolvedValue({ email: "ada@example.com", password: "hash" } as never);
    mockCompare.mockResolvedValue(true);
    mockHash.mockResolvedValue("new-hash");

    const result = await changePassword(null, buildFormData(validForm));

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: "new-hash", passwordChangedAt: expect.any(Date) },
    });
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "ada@example.com",
      password: "new-password",
      redirect: false,
    });
  });
});
