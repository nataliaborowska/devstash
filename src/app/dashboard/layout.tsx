export const dynamic = "force-dynamic";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getFavoriteCollections, getNonFavoriteCollections } from "@/lib/db/collections";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [itemTypes, favoriteCollections, recentCollections] = await Promise.all([
    getItemTypesWithCounts(),
    getFavoriteCollections(),
    getNonFavoriteCollections(),
  ]);

  return (
    <DashboardShell
      itemTypes={itemTypes}
      favoriteCollections={favoriteCollections}
      recentCollections={recentCollections}
    >
      {children}
    </DashboardShell>
  );
}
