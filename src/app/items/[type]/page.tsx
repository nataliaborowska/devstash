import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ItemCard } from "@/components/dashboard/item-card";
import { CreateItemButton } from "@/components/items/create-item-dialog";
import { Pagination } from "@/components/shared/pagination";
import { TypeIcon } from "@/lib/icon-map";
import { getPageHref, getTotalPages, ITEMS_PER_PAGE, parsePageParam } from "@/lib/pagination";
import { getItemsByType, getSystemItemTypeBySlug } from "@/lib/db/items";
import { isCreatableItemType } from "@/lib/validations/items";

interface ItemsByTypePageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function ItemsByTypePage({ params, searchParams }: ItemsByTypePageProps) {
  const [{ type: slug }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const basePath = `/items/${encodeURIComponent(slug)}`;

  const session = await auth();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${basePath}`);

  const itemType = await getSystemItemTypeBySlug(slug);
  if (!itemType) notFound();

  const page = parsePageParam(pageParam);
  const { data: items, total } = await getItemsByType(session.user.id, itemType.id, {
    page,
    perPage: ITEMS_PER_PAGE,
  });

  const totalPages = getTotalPages(total, ITEMS_PER_PAGE);
  if (page > totalPages) redirect(getPageHref(basePath, totalPages));

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
            {total} {total === 1 ? "item" : "items"}
          </p>
        </div>
        {/* File and image types can't be created from the dialog yet. */}
        {isCreatableItemType(itemType.name) && (
          <CreateItemButton
            type={itemType.name}
            label={`New ${itemType.name}`}
            className="ml-auto capitalize"
          />
        )}
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

      <Pagination basePath={basePath} currentPage={page} total={total} perPage={ITEMS_PER_PAGE} />
    </div>
  );
}
