import { describe, expect, it } from "vitest";
import { getHomepageLinks, NAV_ACTIONS, PRICING_PLANS } from "@/lib/homepage";

function getPlan(id: "free" | "pro") {
  const plan = PRICING_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Missing plan ${id}`);
  return plan;
}

describe("PRICING_PLANS", () => {
  it("matches the free tier limits", () => {
    const free = getPlan("free");

    expect(free.prices.monthly.amount).toBe("$0");
    expect(free.features).toContain("50 items");
    expect(free.features).toContain("3 collections");
  });

  it("prices Pro at $8/month or $72/year and features it", () => {
    const pro = getPlan("pro");

    expect(pro.featured).toBe(true);
    expect(pro.prices.monthly).toMatchObject({ amount: "$8", period: "/month" });
    expect(pro.prices.yearly).toMatchObject({ amount: "$72", period: "/year" });
    expect(pro.features).toContain("AI features");
  });
});

describe("NAV_ACTIONS", () => {
  it("links the header buttons to sign in and register", () => {
    expect(NAV_ACTIONS.signIn).toEqual({ label: "Sign In", href: "/sign-in" });
    expect(NAV_ACTIONS.getStarted).toEqual({ label: "Get Started", href: "/register" });
  });
});

describe("getHomepageLinks", () => {
  it("sends signed-out visitors to sign in and register", () => {
    const links = getHomepageLinks(false);

    expect(links.heroPrimary.href).toBe("/register");
    expect(links.ctaPrimary.href).toBe("/register");
    expect(links.plans.free.href).toBe("/register");
    expect(links.plans.pro.href).toBe("/register");
  });

  it("sends signed-in visitors to the app", () => {
    const links = getHomepageLinks(true);

    expect(links.heroPrimary.href).toBe("/dashboard");
    expect(links.ctaPrimary.href).toBe("/dashboard");
    expect(links.plans.free.href).toBe("/dashboard");
    expect(links.plans.pro.href).toBe("/settings");
  });

  it("only links the footer to pages that exist", () => {
    const hrefs = [false, true].flatMap((signedIn) =>
      getHomepageLinks(signedIn).footer.flatMap((column) => column.links.map((link) => link.href)),
    );

    expect(new Set(hrefs)).toEqual(
      new Set(["/#features", "/#pricing", "/sign-in", "/register", "/dashboard", "/settings"]),
    );
  });
});
