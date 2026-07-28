import {
  LayoutDashboard,
  Users,
  UsersRound,
  History,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/members", label: "성도 관리", icon: Users },
  { href: "/groups", label: "그룹 관리", icon: UsersRound },
  { href: "/history", label: "진행 이력", icon: History },
  { href: "/settings", label: "설정", icon: Settings },
];
