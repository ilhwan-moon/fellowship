"use client";

import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { featureBySlug } from "@/features/registry";

function currentTitle(pathname: string) {
  if (pathname.startsWith("/f/")) {
    const slug = pathname.split("/")[2];
    const feature = slug ? featureBySlug(slug) : undefined;
    if (feature) return feature.title;
  }

  const match = NAV_ITEMS.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );
  return match?.label ?? "LA Central Church - 성도 교제";
}

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <MobileNav />
      <h1 className="text-base font-semibold">{currentTitle(pathname)}</h1>
    </header>
  );
}
