import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  primary: cn(buttonVariants({ variant: "default" }), "bg-violet-600 text-white hover:bg-violet-500"),
  outline: buttonVariants({ variant: "outline" }),
  ghost: buttonVariants({ variant: "ghost" }),
};

const SIZE_CLASSES = {
  default: "",
  lg: "h-11 px-6 text-base",
};

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: keyof typeof VARIANT_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function LinkButton({ href, children, variant = "primary", size = "default", className }: LinkButtonProps) {
  return (
    <Link href={href} className={cn(VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}>
      {children}
    </Link>
  );
}
