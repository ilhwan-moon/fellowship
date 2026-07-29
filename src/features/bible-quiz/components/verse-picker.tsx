"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { QuizVerse } from "@/features/bible-quiz/types";

export function VersePicker({
  verses,
  selectedIds,
  onToggle,
}: {
  verses: QuizVerse[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return verses;
    return verses.filter((v) => v.reference.includes(q) || v.text.includes(q));
  }, [verses, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, QuizVerse[]>();
    for (const v of filtered) {
      const key = v.categoryName ?? "미분류";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
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
          placeholder="참조 또는 본문으로 검색"
          className="pl-8"
        />
      </div>

      <div className="max-h-80 space-y-4 overflow-y-auto rounded-lg border p-3">
        {grouped.map(([categoryName, categoryVerses]) => (
          <div key={categoryName} className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">{categoryName}</p>
            {categoryVerses.map((v) => {
              const checked = selectedIds.has(v.id);
              return (
                <label
                  key={v.id}
                  className="flex cursor-pointer items-start gap-2.5 rounded-md px-1.5 py-1.5 hover:bg-muted/60"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onToggle(v.id)}
                    className="mt-0.5"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{v.reference}</span>
                    <span className="block truncate text-xs text-muted-foreground">{v.text}</span>
                  </span>
                </label>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        선택됨
        <Badge variant="secondary">{selectedIds.size}개</Badge>
      </div>
    </div>
  );
}
