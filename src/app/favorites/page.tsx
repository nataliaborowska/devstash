import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { auth } from "@/auth";
import {
  FavoriteCollectionsList,
  FavoriteItemsList,
} from "@/components/favorites/favorites-list";
import { getAllFavoriteCollections } from "@/lib/db/collections";
import { getFavoriteItems } from "@/lib/db/items";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/favorites");
  const userId = session.user.id;

  const [items, collections] = await Promise.all([
    getFavoriteItems(userId),
    getAllFavoriteCollections(userId),
  ]);
  const total = items.length + collections.length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold">Favorites</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? "favorite" : "favorites"}
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No favorites yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Star items and collections to see them here.
          </p>
        </div>
      ) : (
        <>
          {items.length > 0 && <FavoriteItemsList items={items} />}
          {collections.length > 0 && <FavoriteCollectionsList collections={collections} />}
        </>
      )}
    </div>
  );
}
