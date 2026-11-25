import { MOCK_ITEMS, MOCK_NAV } from "@/lib/homepage";
import { cn } from "@/lib/utils";

// Simplified, non-interactive preview of the DevStash dashboard.
export function DashboardMockup() {
  return (
    <div aria-hidden="true" className="flex h-72 overflow-hidden rounded-lg border border-border bg-background text-[11px]">
      <div className="hidden w-28 shrink-0 flex-col gap-1 border-r border-border bg-card p-2 sm:flex">
        <div className="mb-2 flex items-center gap-1.5 font-semibold">
          <span className="size-3.5 rounded bg-gradient-to-br from-blue-500 to-violet-600" />
          DevStash
        </div>
        {MOCK_NAV.map((nav, i) => (
          <div
            key={nav.label}
            className={cn(
              "flex items-center gap-1.5 rounded px-1.5 py-1 text-muted-foreground",
              i === 0 && "bg-muted text-foreground",
            )}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: nav.color }} />
            {nav.label}
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-2.5">
        <div className="flex items-center justify-between rounded-md border border-border bg-card px-2 py-1.5 text-muted-foreground">
          Search items...
          <kbd className="rounded border border-border px-1 font-mono text-[10px]">⌘K</kbd>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 lg:grid-cols-3">
          {MOCK_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-1.5 rounded-md border border-border border-t-2 bg-card p-2"
              style={{ borderTopColor: item.color }}
            >
              <b className="truncate font-medium">{item.title}</b>
              <span className="h-1 rounded-full bg-muted" />
              <span className="h-1 w-2/3 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
