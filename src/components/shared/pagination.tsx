import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getPageHref, getPageLinks, getTotalPages } from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  basePath: string;
  currentPage: number;
  total: number;
  perPage: number;
  className?: string;
}

interface PageStepLinkProps {
  href: string | null;
  label: string;
  direction: "previous" | "next";
}

function PageStepLink({ href, label, direction }: PageStepLinkProps) {
  const content = (
    <>
      {direction === "previous" && <ChevronLeft />}
      <span className="hidden sm:inline">{label}</span>
      {direction === "next" && <ChevronRight />}
    </>
  );
  const className = buttonVariants({ variant: "ghost", size: "sm" });

  if (!href) {
    return (
      <span aria-disabled="true" aria-label={label} className={cn(className, "pointer-events-none opacity-50")}>
        {content}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label} className={className}>
      {content}
    </Link>
  );
}

// Numbered page links with Previous/Next; renders nothing when everything fits on one page.
export function Pagination({ basePath, currentPage, total, perPage, className }: PaginationProps) {
  const totalPages = getTotalPages(total, perPage);
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1", className)}>
      <PageStepLink
        href={currentPage > 1 ? getPageHref(basePath, currentPage - 1) : null}
        label="Previous"
        direction="previous"
      />
      {getPageLinks(currentPage, totalPages).map((link, index) =>
        link === "ellipsis" ? (
          <span key={`ellipsis-${index}`} aria-hidden="true" className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={link}
            href={getPageHref(basePath, link)}
            aria-label={`Page ${link}`}
            aria-current={link === currentPage ? "page" : undefined}
            className={buttonVariants({
              variant: link === currentPage ? "outline" : "ghost",
              size: "icon-sm",
            })}
          >
            {link}
          </Link>
        )
      )}
      <PageStepLink
        href={currentPage < totalPages ? getPageHref(basePath, currentPage + 1) : null}
        label="Next"
        direction="next"
      />
    </nav>
  );
}
