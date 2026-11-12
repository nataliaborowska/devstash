import Link from "next/link";
import { Folder } from "lucide-react";
import { ItemDrawerTrigger } from "@/components/items/item-drawer-provider";
import { TypeIcon } from "@/lib/icon-map";
import type { FavoriteCollection } from "@/lib/db/collections";
import type { FavoriteItem } from "@/lib/db/items";

const ROW_CLASS =
  "flex items-center gap-3 px-2 py-1.5 font-mono text-[13px] hover:bg-accent/40 transition-colors cursor-pointer";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface SectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

function FavoritesSection({ title, count, children }: SectionProps) {
  return (
    <section>
      <h2 className="flex items-center gap-2 px-2 pb-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
        {title}
        <span className="tabular-nums">({count})</span>
      </h2>
      <ul className="divide-y divide-border/50">{children}</ul>
    </section>
  );
}

function RowMeta({ badge, date }: { badge: string; date: Date }) {
  return (
    <>
      <span className="shrink-0 rounded px-1.5 py-px text-[11px] text-muted-foreground bg-muted/60">
        {badge}
      </span>
      <span className="shrink-0 w-24 text-right text-[11px] text-muted-foreground tabular-nums">
        {formatDate(date)}
      </span>
    </>
  );
}

export function FavoriteItemsList({ items }: { items: FavoriteItem[] }) {
  return (
    <FavoritesSection title="Items" count={items.length}>
      {items.map((item) => (
        <li key={item.id}>
          <ItemDrawerTrigger itemId={item.id}>
            <div className={ROW_CLASS}>
              <TypeIcon
                name={item.type.icon}
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: item.type.color ?? undefined }}
              />
              <span className="flex-1 min-w-0 truncate">{item.title}</span>
              <RowMeta badge={item.type.name} date={item.updatedAt} />
            </div>
          </ItemDrawerTrigger>
        </li>
      ))}
    </FavoritesSection>
  );
}

export function FavoriteCollectionsList({ collections }: { collections: FavoriteCollection[] }) {
  return (
    <FavoritesSection title="Collections" count={collections.length}>
      {collections.map((collection) => (
        <li key={collection.id}>
          <Link
            href={`/collections/${collection.id}`}
            className={`${ROW_CLASS} outline-none focus-visible:bg-accent/40`}
          >
            <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="flex-1 min-w-0 truncate">{collection.name}</span>
            <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
              {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
            </span>
            <RowMeta badge="collection" date={collection.updatedAt} />
          </Link>
        </li>
      ))}
    </FavoritesSection>
  );
}
