"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "@/components/domain/member-avatar";
import type { Participant } from "@/features/ladder/types";

export function MemberPicker({
  members,
  selectedKeys,
  onToggle,
  onToggleGroup,
}: {
  members: Participant[];
  selectedKeys: Set<string>;
  onToggle: (key: string) => void;
  onToggleGroup: (keys: string[], select: boolean) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return members;
    return members.filter((m) => m.name.includes(q));
  }, [members, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Participant[]>();
    for (const m of filtered) {
      const key = m.groupName ?? "미배정";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름으로 검색"
          className="pl-8"
        />
      </div>

      {members.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          등록된 성도가 없습니다. 성도 관리에서 먼저 등록해주세요.
        </p>
      ) : (
        <div className="max-h-72 space-y-4 overflow-y-auto rounded-lg border p-3">
          {grouped.map(([groupName, groupMembers]) => {
            const groupKeys = groupMembers.map((m) => m.key);
            const selectedCount = groupKeys.filter((k) => selectedKeys.has(k)).length;
            const allSelected = selectedCount === groupKeys.length;
            const someSelected = selectedCount > 0 && !allSelected;

            return (
            <div key={groupName} className="space-y-1.5">
              <label className="flex cursor-pointer items-center gap-2 px-1.5 py-0.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={() => onToggleGroup(groupKeys, !allSelected)}
                />
                {groupName}
                <span className="font-normal">
                  ({selectedCount}/{groupKeys.length})
                </span>
              </label>
              {groupMembers.map((m) => {
                const checked = selectedKeys.has(m.key);
                return (
                  <label
                    key={m.key}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 hover:bg-muted/60"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => onToggle(m.key)}
                    />
                    <MemberAvatar name={m.name} photoUrl={m.photoUrl} className="size-7" />
                    <span className="text-sm">{m.name}</span>
                  </label>
                );
              })}
            </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        선택됨
        <Badge variant="secondary">{selectedKeys.size}명</Badge>
      </div>
    </div>
  );
}
