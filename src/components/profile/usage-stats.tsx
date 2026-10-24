import { FolderOpen, Layers } from "lucide-react";
import { TypeIcon } from "@/lib/icon-map";
import type { UserUsageStats } from "@/lib/db/items";

interface UsageStatsProps {
  stats: UserUsageStats;
}

export function UsageStats({ stats }: UsageStatsProps) {
  const totals = [
    { label: "Total Items", value: stats.totalItems, icon: Layers, color: "text-blue-400" },
    { label: "Collections", value: stats.totalCollections, icon: FolderOpen, color: "text-violet-400" },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold">Usage</h2>

      <div className="grid grid-cols-2 gap-4">
        {totals.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
            <div className="rounded-md bg-muted p-2 shrink-0">
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {stats.itemTypes.map((type) => (
          <div key={type.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <TypeIcon name={type.icon} className="h-4 w-4 shrink-0" style={{ color: type.color ?? undefined }} />
            <span className="capitalize flex-1">{type.name}s</span>
            <span className="tabular-nums text-muted-foreground">{type.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
