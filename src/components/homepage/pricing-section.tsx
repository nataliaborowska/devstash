import { PricingCards } from "@/components/homepage/pricing-cards";
import { Reveal } from "@/components/homepage/reveal";
import { SectionHeading } from "@/components/homepage/section-heading";
import { SECTION_IDS, type HomepageLinks } from "@/lib/homepage";

interface PricingSectionProps {
  planLinks: HomepageLinks["plans"];
}

export function PricingSection({ planLinks }: PricingSectionProps) {
  return (
    <section id={SECTION_IDS.pricing} className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Pricing" title="Start free, upgrade when you're hooked" />
          <PricingCards planLinks={planLinks} />
        </Reveal>
      </div>
    </section>
  );
}
