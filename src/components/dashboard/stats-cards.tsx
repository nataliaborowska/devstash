import { Layers, FolderOpen, Star, Bookmark } from "lucide-react";

interface StatsCardsProps {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export function StatsCards({
  totalItems,
  totalCollections,
  favoriteItems,
  favoriteCollections,
}: StatsCardsProps) {
  const stats = [
    { label: "Total Items", value: totalItems, icon: Layers, color: "text-blue-400" },
    { label: "Collections", value: totalCollections, icon: FolderOpen, color: "text-violet-400" },
    { label: "Favorite Items", value: favoriteItems, icon: Star, color: "text-yellow-400" },
    { label: "Favorite Collections", value: favoriteCollections, icon: Bookmark, color: "text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-lg border border-border bg-card p-4 flex items-center gap-3"
        >
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
  );
}
