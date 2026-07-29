"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, List, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/domain/member-avatar";
import type { LadderResultEntry } from "@/features/ladder/types";
import { cn } from "@/lib/utils";

export function ResultView({
  entries,
  isFullscreen = false,
}: {
  entries: LadderResultEntry[];
  isFullscreen?: boolean;
}) {
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
        <PresenterCard
          entries={entries}
          current={current}
          onChange={setCurrent}
          isFullscreen={isFullscreen}
        />
      )}
    </div>
  );
}

function PresenterCard({
  entries,
  current,
  onChange,
  isFullscreen,
}: {
  entries: LadderResultEntry[];
  current: number;
  onChange: (i: number) => void;
  isFullscreen: boolean;
}) {
  const entry = entries[current];
  const next = entries[current + 1];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 rounded-2xl border bg-card px-6 py-10 sm:py-16",
        isFullscreen && "min-h-[85vh] justify-center gap-10 border-none py-0",
      )}
    >
      <span
        className={cn(
          "font-medium text-muted-foreground",
          isFullscreen ? "text-2xl sm:text-3xl" : "text-sm",
        )}
      >
        {current + 1} / {entries.length}번째 순서
      </span>

      <MemberAvatar
        name={entry.name}
        photoUrl={entry.photoUrl}
        className={cn("size-32 text-4xl sm:size-44 sm:text-6xl")}
        style={
          isFullscreen
            ? {
                width: "clamp(220px, 34vmin, 460px)",
                height: "clamp(220px, 34vmin, 460px)",
                fontSize: "clamp(4rem, 12vmin, 9rem)",
              }
            : undefined
        }
      />

      <div className="text-center">
        <p
          className={cn("font-bold", isFullscreen ? "" : "text-3xl sm:text-5xl")}
          style={isFullscreen ? { fontSize: "clamp(3rem, 9vmin, 7rem)" } : undefined}
        >
          {entry.name}
        </p>
        {entry.groupName && (
          <p
            className={cn(
              "mt-1 text-muted-foreground",
              isFullscreen ? "text-2xl sm:text-3xl" : "text-sm sm:text-base",
            )}
          >
            {entry.groupName}
          </p>
        )}
      </div>

      {next && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-full bg-muted/60 pr-4 pl-1.5",
            isFullscreen ? "py-3 text-xl sm:text-2xl" : "py-1.5 text-sm",
          )}
        >
          <MemberAvatar
            name={next.name}
            photoUrl={next.photoUrl}
            className={isFullscreen ? "" : "size-7"}
            style={
              isFullscreen
                ? { width: "clamp(40px, 5vmin, 64px)", height: "clamp(40px, 5vmin, 64px)" }
                : undefined
            }
          />
          <span className="text-muted-foreground">다음 순서</span>
          <span className="font-semibold">{next.name}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size={isFullscreen ? "icon-lg" : "icon"}
          disabled={current === 0}
          onClick={() => onChange(current - 1)}
        >
          <ChevronLeft className={isFullscreen ? "size-6" : "size-4"} />
        </Button>
        <div className="flex gap-1.5">
          {entries.map((_, i) => (
            <span
              key={i}
              className={cn(
                "rounded-full bg-muted-foreground/30",
                isFullscreen ? "size-2.5" : "size-1.5",
                i === current && "bg-primary",
              )}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size={isFullscreen ? "icon-lg" : "icon"}
          disabled={current === entries.length - 1}
          onClick={() => onChange(current + 1)}
        >
          <ChevronRight className={isFullscreen ? "size-6" : "size-4"} />
        </Button>
      </div>
    </div>
  );
}
