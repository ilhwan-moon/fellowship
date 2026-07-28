import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserFooter } from "@/components/layout/user-footer";

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-slate-950 md:flex">
      <Brand />
      <div className="flex-1 overflow-y-auto py-2">
        <SidebarNav />
      </div>
      <UserFooter />
    </aside>
  );
}
