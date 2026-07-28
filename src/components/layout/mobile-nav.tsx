"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserFooter } from "@/components/layout/user-footer";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-slate-300 hover:bg-white/10 hover:text-white md:hidden"
        >
          <Menu className="size-5" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="flex w-3/4 max-w-xs flex-col gap-0 border-white/10 bg-slate-950 p-0"
      >
        <SheetTitle className="sr-only">메뉴</SheetTitle>
        <Brand />
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
        <UserFooter />
      </SheetContent>
    </Sheet>
  );
}
