import type { ReactNode } from "react";
import { Calendar, FolderOpen, type LucideIcon } from "lucide-react";
import type { ItemDetailData } from "@/components/items/item-drawer";

interface DetailSectionProps {
  label: string;
  icon?: LucideIcon;
  htmlFor?: string;
  children: ReactNode;
}

export function DetailSection({ label, icon: Icon, htmlFor, children }: DetailSectionProps) {
  const Heading = htmlFor ? "label" : "h3";
  return (
    <section className="space-y-2">
      <Heading
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </Heading>
      {children}
    </section>
  );
}

// Collection and dates are display-only in both view and edit mode.
export function ItemMetaSections({ item }: { item: ItemDetailData }) {
  return (
    <>
      <DetailSection icon={FolderOpen} label="Collections">
        {item.collection ? (
          <span className="inline-block rounded border border-border px-2 py-0.5 text-xs">
            {item.collection.name}
          </span>
        ) : (
          <p className="text-sm text-muted-foreground">Not in a collection</p>
        )}
      </DetailSection>

      <DetailSection icon={Calendar} label="Details">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatLongDate(item.createdAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Updated</dt>
            <dd>{formatLongDate(item.updatedAt)}</dd>
          </div>
        </dl>
      </DetailSection>
    </>
  );
}

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
