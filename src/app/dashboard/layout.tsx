export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getItemTypesWithCounts, getSearchItems } from "@/lib/db/items";
import {
  getCollectionOptions,
  getFavoriteCollections,
  getNonFavoriteCollections,
} from "@/lib/db/collections";
import { getEditorPreferences, getSidebarUser } from "@/lib/db/users";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [
    user,
    editorPreferences,
    itemTypes,
    favoriteCollections,
    recentCollections,
    collectionOptions,
    searchItems,
  ] = await Promise.all([
    getSidebarUser(session.user.id),
    getEditorPreferences(session.user.id),
    getItemTypesWithCounts(),
    getFavoriteCollections(session.user.id),
    getNonFavoriteCollections(session.user.id),
    getCollectionOptions(session.user.id),
    getSearchItems(session.user.id),
  ]);

  if (!user) redirect("/sign-in");

  return (
    <DashboardShell
      user={user}
      editorPreferences={editorPreferences}
      itemTypes={itemTypes}
      favoriteCollections={favoriteCollections}
      recentCollections={recentCollections}
      collectionOptions={collectionOptions}
      searchItems={searchItems}
    >
      {children}
    </DashboardShell>
  );
}
