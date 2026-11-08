import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CollectionCard } from "@/components/dashboard/collection-card";
import { CreateCollectionButton } from "@/components/collections/create-collection-dialog";
import { Pagination } from "@/components/shared/pagination";
import { getCollectionsPage } from "@/lib/db/collections";
import {
  COLLECTIONS_PER_PAGE,
  getPageHref,
  getTotalPages,
  parsePageParam,
} from "@/lib/pagination";

const BASE_PATH = "/collections";

interface CollectionsPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${BASE_PATH}`);

  const page = parsePageParam((await searchParams).page);
  const { data: collections, total } = await getCollectionsPage(session.user.id, {
    page,
    perPage: COLLECTIONS_PER_PAGE,
  });

  const totalPages = getTotalPages(total, COLLECTIONS_PER_PAGE);
  if (page > totalPages) redirect(getPageHref(BASE_PATH, totalPages));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? "collection" : "collections"}
          </p>
        </div>
        <CreateCollectionButton className="ml-auto" />
      </div>

      {/* Collections */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        </div>
      )}

      <Pagination
        basePath={BASE_PATH}
        currentPage={page}
        total={total}
        perPage={COLLECTIONS_PER_PAGE}
      />
    </div>
  );
}
