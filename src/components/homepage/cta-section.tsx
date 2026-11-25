import { LinkButton } from "@/components/homepage/link-button";
import { Reveal } from "@/components/homepage/reveal";
import type { HomepageLink } from "@/lib/homepage";

interface CtaSectionProps {
  link: HomepageLink;
}

export function CtaSection({ link }: CtaSectionProps) {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <Reveal className="mx-auto max-w-4xl rounded-2xl border border-border bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.25),transparent_65%)] bg-card px-6 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Organize Your Knowledge?</h2>
        <p className="mx-auto mt-4 mb-8 max-w-xl text-muted-foreground">
          Join developers who stopped losing snippets, prompts, and commands.
        </p>
        <LinkButton href={link.href} size="lg">
          {link.label}
        </LinkButton>
      </Reveal>
    </section>
  );
}
