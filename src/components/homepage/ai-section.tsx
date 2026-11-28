import { Sparkles } from "lucide-react";
import { AiTags } from "@/components/homepage/ai-tags";
import { Checklist } from "@/components/homepage/checklist";
import { Reveal } from "@/components/homepage/reveal";
import { Badge } from "@/components/ui/badge";
import { AI_CAPABILITIES } from "@/lib/homepage";

const KEYWORD = "text-violet-400";
const FUNCTION = "text-blue-400";
const TYPE = "text-emerald-400";
const NUMBER = "text-orange-400";

export function AiSection() {
  return (
    <section className="border-y border-border bg-card/30 py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal className="min-w-0">
          <Badge className="mb-4 border-violet-500/30 bg-violet-500/10 text-violet-300">Pro Feature</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Let AI do the organizing</h2>
          <p className="mt-4 mb-8 text-muted-foreground">
            DevStash reads what you save and keeps your knowledge tidy, so you can get back to building.
          </p>
          <Checklist items={AI_CAPABILITIES} />
        </Reveal>

        <Reveal className="min-w-0">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
              <span className="size-3 rounded-full bg-red-500/80" />
              <span className="size-3 rounded-full bg-yellow-500/80" />
              <span className="size-3 rounded-full bg-green-500/80" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">use-debounce.ts</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:text-sm">
              <code>
                <span className={KEYWORD}>export function</span> <span className={FUNCTION}>useDebounce</span>&lt;
                <span className={TYPE}>T</span>&gt;(value: <span className={TYPE}>T</span>, delay ={" "}
                <span className={NUMBER}>300</span>) {"{"}
                {"\n  "}
                <span className={KEYWORD}>const</span> [debounced, setDebounced] ={" "}
                <span className={FUNCTION}>useState</span>(value);
                {"\n\n  "}
                <span className={FUNCTION}>useEffect</span>(() =&gt; {"{"}
                {"\n    "}
                <span className={KEYWORD}>const</span> id = <span className={FUNCTION}>setTimeout</span>(() =&gt;{" "}
                <span className={FUNCTION}>setDebounced</span>(value), delay);
                {"\n    "}
                <span className={KEYWORD}>return</span> () =&gt; <span className={FUNCTION}>clearTimeout</span>(id);
                {"\n  }, [value, delay]);\n\n  "}
                <span className={KEYWORD}>return</span> debounced;
                {"\n}"}
              </code>
            </pre>
            <div className="border-t border-border p-4">
              <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Sparkles className="size-3.5 text-violet-400" aria-hidden="true" />
                AI Generated Tags
              </p>
              <AiTags />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
