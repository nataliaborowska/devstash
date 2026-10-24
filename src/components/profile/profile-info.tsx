import { UserAvatar } from "@/components/shared/user-avatar";
import type { ProfileUser } from "@/lib/db/users";

interface ProfileInfoProps {
  user: ProfileUser;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center gap-5">
      <UserAvatar
        name={user.name}
        email={user.email}
        image={user.image}
        size="lg"
        className="size-20 [&_[data-slot=avatar-fallback]]:text-2xl"
      />
      <dl className="grid gap-3 text-sm min-w-0">
        <div>
          <dt className="text-xs text-muted-foreground">Name</dt>
          <dd className="font-medium truncate">{user.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Email</dt>
          <dd className="font-medium truncate">{user.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Member since</dt>
          <dd className="font-medium">
            <time dateTime={user.createdAt.toISOString()}>{DATE_FORMAT.format(user.createdAt)}</time>
          </dd>
        </div>
      </dl>
    </section>
  );
}
