import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ItemCard } from "@/components/dashboard/item-card";
import { TypeIcon } from "@/lib/icon-map";
import { getItemsByType, getSystemItemTypeBySlug } from "@/lib/db/items";

interface ItemsByTypePageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsByTypePage({ params }: ItemsByTypePageProps) {
  const { type: slug } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=/items/${encodeURIComponent(slug)}`);

  const itemType = await getSystemItemTypeBySlug(slug);
  if (!itemType) notFound();

  const items = await getItemsByType(session.user.id, itemType.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md flex items-center justify-center bg-muted">
          <TypeIcon
            name={itemType.icon}
            className="h-5 w-5"
            style={{ color: itemType.color ?? undefined }}
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold capitalize">{slug}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Items */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No {slug} yet.</p>
        </div>
      )}
    </div>
  );
}
