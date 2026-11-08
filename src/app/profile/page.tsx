import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileInfo } from "@/components/profile/profile-info";
import { UsageStats } from "@/components/profile/usage-stats";
import { getProfileUser } from "@/lib/db/users";
import { getUserUsageStats } from "@/lib/db/items";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/profile");

  const [user, stats] = await Promise.all([
    getProfileUser(session.user.id),
    getUserUsageStats(session.user.id),
  ]);
  if (!user) redirect("/sign-in");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your account details and usage</p>
      </div>

      <ProfileInfo user={user} />

      <UsageStats stats={stats} />
    </div>
  );
}
