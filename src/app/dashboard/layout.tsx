export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getFavoriteCollections, getNonFavoriteCollections } from "@/lib/db/collections";
import { getSidebarUser } from "@/lib/db/users";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [user, itemTypes, favoriteCollections, recentCollections] = await Promise.all([
    getSidebarUser(session.user.id),
    getItemTypesWithCounts(),
    getFavoriteCollections(),
    getNonFavoriteCollections(),
  ]);

  if (!user) redirect("/sign-in");

  return (
    <DashboardShell
      user={user}
      itemTypes={itemTypes}
      favoriteCollections={favoriteCollections}
      recentCollections={recentCollections}
    >
      {children}
    </DashboardShell>
  );
}
