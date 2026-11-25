import type { Metadata } from "next";
import { auth } from "@/auth";
import { AiSection } from "@/components/homepage/ai-section";
import { CtaSection } from "@/components/homepage/cta-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import { HeroSection } from "@/components/homepage/hero-section";
import { HomepageFooter } from "@/components/homepage/homepage-footer";
import { HomepageNav } from "@/components/homepage/homepage-nav";
import { PricingSection } from "@/components/homepage/pricing-section";
import { getHomepageLinks } from "@/lib/homepage";

export const metadata: Metadata = {
  title: "DevStash | Store Smarter. Build Faster.",
  description:
    "DevStash is one searchable hub for your code snippets, AI prompts, commands, notes, files, images, and links.",
};

export default async function HomePage() {
  const session = await auth();
  const links = getHomepageLinks(Boolean(session?.user));

  return (
    <div id="homepage" className="flex flex-1 flex-col">
      <HomepageNav />
      <main className="flex-1">
        <HeroSection primaryLink={links.heroPrimary} />
        <FeaturesSection />
        <AiSection />
        <PricingSection planLinks={links.plans} />
        <CtaSection link={links.ctaPrimary} />
      </main>
      <HomepageFooter columns={links.footer} />
    </div>
  );
}
