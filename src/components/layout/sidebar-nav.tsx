"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { FEATURES } from "@/features/registry";

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      {label}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
      {children}
    </p>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [home, ...rest] = NAV_ITEMS;

  return (
    <nav className="flex flex-col gap-1 px-3">
      <NavLink
        href={home.href}
        label={home.label}
        icon={home.icon}
        active={pathname === "/"}
        onNavigate={onNavigate}
      />

      <SectionLabel>기능</SectionLabel>
      {FEATURES.map((feature) => (
        <NavLink
          key={feature.slug}
          href={`/f/${feature.slug}`}
          label={feature.title}
          icon={feature.icon}
          active={pathname.startsWith(`/f/${feature.slug}`)}
          onNavigate={onNavigate}
        />
      ))}

      <SectionLabel>관리</SectionLabel>
      {rest.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          active={pathname.startsWith(item.href)}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
