import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { ChaosIcons } from "@/components/homepage/chaos-icons";
import { DashboardMockup } from "@/components/homepage/dashboard-mockup";
import { LinkButton } from "@/components/homepage/link-button";
import { Reveal } from "@/components/homepage/reveal";
import { SECTION_IDS, type HomepageLink } from "@/lib/homepage";

interface HeroSectionProps {
  primaryLink: HomepageLink;
}

export function HeroSection({ primaryLink }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_at_50%_30%,rgba(139,92,246,0.22),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-violet-400">
            Your developer knowledge hub
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Stop Losing Your
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              Developer Knowledge
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Snippets in VS Code, prompts in chat history, commands in bash history, links buried in bookmarks.
            DevStash brings it all into one fast, searchable, AI-enhanced hub.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href={primaryLink.href} size="lg">
              {primaryLink.label}
            </LinkButton>
            <LinkButton href={`#${SECTION_IDS.features}`} variant="outline" size="lg">
              See Features
            </LinkButton>
          </div>
        </Reveal>

        <Reveal className="mt-16 flex flex-col items-stretch gap-6 md:flex-row md:items-center">
          <HeroPanel label="Your knowledge today...">
            <ChaosIcons />
          </HeroPanel>
          <div
            aria-hidden="true"
            className="flex size-14 shrink-0 animate-arrow-pulse items-center justify-center self-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-violet-600/30"
          >
            <ArrowRight className="size-6 rotate-90 text-white md:rotate-0" />
          </div>
          <HeroPanel label="...with DevStash">
            <DashboardMockup />
          </HeroPanel>
        </Reveal>
      </div>
    </section>
  );
}

interface HeroPanelProps {
  label: string;
  children: ReactNode;
}

function HeroPanel({ label, children }: HeroPanelProps) {
  return (
    <div className="min-w-0 flex-1 rounded-xl border border-border bg-card/60 p-4">
      <p className="mb-3 text-sm font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
