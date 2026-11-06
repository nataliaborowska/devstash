import { notFound, redirect } from "next/navigation";
import { Folder, Star } from "lucide-react";
import { auth } from "@/auth";
import { ItemCard } from "@/components/dashboard/item-card";
import { getCollectionById } from "@/lib/db/collections";
import { getItemsByCollection } from "@/lib/db/items";

interface CollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=/collections/${encodeURIComponent(id)}`);
  const userId = session.user.id;

  const [collection, items] = await Promise.all([
    getCollectionById(userId, id),
    getItemsByCollection(userId, id),
  ]);
  if (!collection) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-md flex items-center justify-center bg-muted">
          <Folder className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold truncate">{collection.name}</h1>
            {collection.isFavorite && (
              <Star className="h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          {collection.description && (
            <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
          )}
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
          <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
        </div>
      )}
    </div>
  );
}
