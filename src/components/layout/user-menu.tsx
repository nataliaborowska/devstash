"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, User } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SidebarUser } from "@/lib/db/users";

interface UserMenuProps {
  user: SidebarUser;
  compact?: boolean;
  onNavigate?: () => void;
}

export function UserMenu({ user, compact = false, onNavigate }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className={cn(
          "flex items-center rounded-md transition-colors hover:bg-accent outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          compact ? "p-0.5" : "w-full gap-2 p-1.5 text-left"
        )}
      >
        <UserAvatar name={user.name} email={user.email} image={user.image} size="sm" className="size-7" />
        {!compact && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium leading-tight">{user.name ?? user.email}</p>
              {user.name && (
                <p className="truncate text-[11px] leading-tight text-muted-foreground">{user.email}</p>
              )}
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={compact ? "right" : "top"}
        align={compact ? "end" : "start"}
        className={cn(compact && "w-48")}
      >
        <DropdownMenuItem render={<Link href="/profile" />} onClick={onNavigate}>
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOutAction()}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
