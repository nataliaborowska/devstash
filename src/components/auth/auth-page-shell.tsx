import { HomepageNav } from "@/components/homepage/homepage-nav";

interface AuthPageShellProps {
  children: React.ReactNode;
}

// Auth page frame: the homepage's fixed nav, with content offset below its 64px height.
export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <>
      <HomepageNav />
      <main className="flex flex-1 flex-col pt-16">{children}</main>
    </>
  );
}
