import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserFooter() {
  return (
    <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
      <Avatar className="size-9">
        <AvatarFallback className="bg-gradient-to-br from-sky-400 to-fuchsia-500 text-xs font-semibold text-white">
          인도
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">인도자</p>
        <p className="truncate text-xs text-slate-400">LEADER</p>
      </div>
    </div>
  );
}
