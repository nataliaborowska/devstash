import { Reveal } from "@/components/homepage/reveal";
import { SectionHeading } from "@/components/homepage/section-heading";
import { FEATURES, SECTION_IDS } from "@/lib/homepage";

export function FeaturesSection() {
  return (
    <section id={SECTION_IDS.features} className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title="Everything you reach for, in one place"
            description="Every type of developer knowledge gets a home, a color, and instant search."
          />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, description, icon: Icon, color }) => (
            <Reveal key={title} className="h-full">
              <article
                className="h-full rounded-xl border border-border border-t-2 bg-card p-6 transition-transform hover:-translate-y-1"
                style={{ borderTopColor: color }}
              >
                <div
                  className="mb-4 flex size-11 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${color}1f`, color }}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
