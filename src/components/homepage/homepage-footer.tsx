import Link from "next/link";
import { Logo } from "@/components/homepage/logo";
import type { HomepageLinks } from "@/lib/homepage";

interface HomepageFooterProps {
  columns: HomepageLinks["footer"];
}

export function HomepageFooter({ columns }: HomepageFooterProps) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">Store Smarter. Build Faster.</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h4 className="mb-3 text-sm font-semibold">{column.title}</h4>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-6xl border-t border-border px-4 py-6 text-sm text-muted-foreground sm:px-6">
        &copy; {new Date().getFullYear()} DevStash. All rights reserved.
      </div>
    </footer>
  );
}
