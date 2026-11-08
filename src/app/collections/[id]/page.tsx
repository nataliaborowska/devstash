import { notFound, redirect } from "next/navigation";
import { Folder } from "lucide-react";
import { auth } from "@/auth";
import { CollectionActions } from "@/components/collections/collection-actions";
import { ItemCard } from "@/components/dashboard/item-card";
import { Pagination } from "@/components/shared/pagination";
import { getCollectionById } from "@/lib/db/collections";
import { getItemsByCollection } from "@/lib/db/items";
import { getPageHref, getTotalPages, ITEMS_PER_PAGE, parsePageParam } from "@/lib/pagination";

interface CollectionPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const [{ id }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const basePath = `/collections/${encodeURIComponent(id)}`;

  const session = await auth();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${basePath}`);
  const userId = session.user.id;

  const page = parsePageParam(pageParam);
  const [collection, { data: items, total }] = await Promise.all([
    getCollectionById(userId, id),
    getItemsByCollection(userId, id, { page, perPage: ITEMS_PER_PAGE }),
  ]);
  if (!collection) notFound();

  const totalPages = getTotalPages(total, ITEMS_PER_PAGE);
  if (page > totalPages) redirect(getPageHref(basePath, totalPages));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-md flex items-center justify-center bg-muted">
          <Folder className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold truncate">{collection.name}</h1>
          {collection.description && (
            <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? "item" : "items"}
          </p>
        </div>
        <CollectionActions collection={collection} className="shrink-0" />
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

      <Pagination basePath={basePath} currentPage={page} total={total} perPage={ITEMS_PER_PAGE} />
    </div>
  );
}
