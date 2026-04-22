"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/fortress-30": "Fortress 30",
  "/investment-genie": "Investment Genie",
  "/v5-extension": "Deep Value Scanner",
  "/intelligence": "Intelligence",
  "/macro": "Market Pulse",
  "/alpha": "Sovereign Alpha",
  "/guide": "Guide",
  "/admin": "Admin",
  "/login": "Login",
};

export function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

    // Add current page if not home
    if (pathname !== "/") {
      const label = ROUTE_LABELS[pathname] || pathname.split("/").pop() || "Page";
      items.push({ label });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length === 1) {
    return null; // Don't show breadcrumb on home page
  }

  return (
    <nav
      className={cn(
        "sticky top-14 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 px-4 sm:px-8 py-2.5",
        className
      )}
      aria-label="Breadcrumb"
    >
      <div className="container flex items-center gap-2 text-sm">
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
