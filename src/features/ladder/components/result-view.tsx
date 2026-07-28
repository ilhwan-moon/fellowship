"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, List, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/domain/member-avatar";
import type { LadderResultEntry } from "@/features/ladder/types";
import { cn } from "@/lib/utils";

export function ResultView({ entries }: { entries: LadderResultEntry[] }) {
  const [mode, setMode] = useState<"list" | "presenter">("list");
  const [current, setCurrent] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant={mode === "list" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setMode("list")}
        >
          <List className="size-4" />
          목록
        </Button>
        <Button
          type="button"
          variant={mode === "presenter" ? "secondary" : "outline"}
          size="sm"
          onClick={() => {
            setMode("presenter");
            setCurrent(0);
          }}
        >
          <Presentation className="size-4" />
          간증 진행 모드
        </Button>
      </div>

      {mode === "list" ? (
        <div className="divide-y overflow-hidden rounded-xl border">
          {entries.map((e) => (
            <div key={e.key} className="flex items-center gap-3 px-4 py-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {e.orderNo}
              </span>
              <MemberAvatar name={e.name} photoUrl={e.photoUrl} className="size-10" />
              <span className="font-medium">{e.name}</span>
              {e.groupName && (
                <span className="ml-auto text-xs text-muted-foreground">{e.groupName}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <PresenterCard entries={entries} current={current} onChange={setCurrent} />
      )}
    </div>
  );
}

function PresenterCard({
  entries,
  current,
  onChange,
}: {
  entries: LadderResultEntry[];
  current: number;
  onChange: (i: number) => void;
}) {
  const entry = entries[current];

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border bg-card px-6 py-10 sm:py-16">
      <span className="text-sm font-medium text-muted-foreground">
        {current + 1} / {entries.length}번째 순서
      </span>

      <MemberAvatar
        name={entry.name}
        photoUrl={entry.photoUrl}
        className="size-32 text-4xl sm:size-44 sm:text-6xl"
      />

      <div className="text-center">
        <p className="text-3xl font-bold sm:text-5xl">{entry.name}</p>
        {entry.groupName && (
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{entry.groupName}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={current === 0}
          onClick={() => onChange(current - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex gap-1.5">
          {entries.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full bg-muted-foreground/30",
                i === current && "bg-primary",
              )}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={current === entries.length - 1}
          onClick={() => onChange(current + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
