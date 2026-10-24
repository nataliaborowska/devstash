import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileInfo } from "@/components/profile/profile-info";
import { UsageStats } from "@/components/profile/usage-stats";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
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

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Account</h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {user.hasPassword && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">Change the password you use to sign in.</p>
              </div>
              <ChangePasswordDialog />
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground">
                Permanently remove your account and all of its data.
              </p>
            </div>
            <DeleteAccountDialog />
          </div>
        </div>
      </section>
    </div>
  );
}
