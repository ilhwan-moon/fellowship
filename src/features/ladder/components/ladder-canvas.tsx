"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/domain/member-avatar";
import { cn } from "@/lib/utils";
import type { Participant } from "@/features/ladder/types";
import { computeResultOrder, type LadderRung } from "@/features/ladder/lib/generate-ladder";

const COL_W = 64;
const ROW_H = 20;
const TOP_H = 88;
const BOTTOM_H = 48;
const PAD_X = 32;
const PAUSE_MS = 550;

const BALL_COLORS = [
  "#38bdf8",
  "#f472b6",
  "#34d399",
  "#fb923c",
  "#a78bfa",
  "#facc15",
  "#fb7185",
  "#4ade80",
  "#60a5fa",
  "#e879f9",
];

type Keyframe = { t: number; x: number; y: number };
type RevealedEntry = Participant & { orderNo: number };

function buildKeyframes(
  startIndex: number,
  count: number,
  rungsByRow: Set<number>[],
  rows: number,
): Keyframe[] {
  const colX = (i: number) => PAD_X + COL_W * i;
  const rowY = (r: number) => TOP_H + ROW_H * r;

  const frames: Keyframe[] = [{ t: 0, x: colX(startIndex), y: rowY(0) }];
  let pos = startIndex;

  for (let row = 0; row < rows; row++) {
    const rowStartT = row / rows;
    const rowEndT = (row + 1) / rows;
    let newPos = pos;
    if (rungsByRow[row].has(pos)) newPos = pos + 1;
    else if (rungsByRow[row].has(pos - 1)) newPos = pos - 1;

    if (newPos !== pos) {
      const rungY = rowY(row) + ROW_H * 0.5;
      frames.push({ t: rowStartT + (rowEndT - rowStartT) * 0.35, x: colX(pos), y: rungY });
      frames.push({ t: rowStartT + (rowEndT - rowStartT) * 0.65, x: colX(newPos), y: rungY });
    }
    frames.push({ t: rowEndT, x: colX(newPos), y: rowY(row + 1) });
    pos = newPos;
  }

  return frames;
}

function interpolate(frames: Keyframe[], t: number): { x: number; y: number } {
  if (t <= frames[0].t) return frames[0];
  for (let i = 1; i < frames.length; i++) {
    if (t <= frames[i].t) {
      const a = frames[i - 1];
      const b = frames[i];
      const span = b.t - a.t || 1;
      const ratio = (t - a.t) / span;
      return { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio };
    }
  }
  return frames[frames.length - 1];
}

export function LadderCanvas({
  participants,
  rungs,
  rows,
  onComplete,
}: {
  participants: Participant[];
  rungs: LadderRung[];
  rows: number;
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState<RevealedEntry[]>([]);
  const finishAllRef = useRef<() => void>(() => {});
  const count = participants.length;
  const done = currentIndex >= count;

  const colX = (i: number) => PAD_X + COL_W * i;
  const rowY = (r: number) => TOP_H + ROW_H * r;
  const width = PAD_X * 2 + COL_W * (count - 1);
  const height = TOP_H + ROW_H * rows + BOTTOM_H;
  const perBallMs = Math.max(650, 1500 - count * 70);

  const rungsByRow = useMemo(() => {
    const byRow: Set<number>[] = Array.from({ length: rows }, () => new Set());
    for (const r of rungs) byRow[r.row].add(r.leftIndex);
    return byRow;
  }, [rungs, rows]);

  const mapping = useMemo(
    () => computeResultOrder(count, rungs, rows),
    [count, rungs, rows],
  );

  const paths = useMemo(
    () => participants.map((_, i) => buildKeyframes(i, count, rungsByRow, rows)),
    [participants, count, rungsByRow, rows],
  );

  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    let pauseTimeout: ReturnType<typeof setTimeout> | null = null;

    function drawFrame(activeIndex: number, activeProgress: number) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, width, height);

      // 세로줄
      ctx.strokeStyle = "rgba(15, 23, 42, 0.14)";
      ctx.lineWidth = 2;
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.moveTo(colX(i), rowY(0));
        ctx.lineTo(colX(i), rowY(rows));
        ctx.stroke();
      }

      // 가로줄
      ctx.strokeStyle = "rgba(15, 23, 42, 0.32)";
      ctx.lineWidth = 2.5;
      for (const r of rungs) {
        const y = rowY(r.row) + ROW_H * 0.5;
        ctx.beginPath();
        ctx.moveTo(colX(r.leftIndex), y);
        ctx.lineTo(colX(r.leftIndex + 1), y);
        ctx.stroke();
      }

      // 이미 도착한 참가자들 - 최종 위치에 고정
      for (let i = 0; i < activeIndex; i++) {
        const color = BALL_COLORS[i % BALL_COLORS.length];
        const finalPos = paths[i][paths[i].length - 1];
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(finalPos.x, finalPos.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 현재 이동 중인 참가자 - 경로 + 공
      if (activeIndex < count) {
        const color = BALL_COLORS[activeIndex % BALL_COLORS.length];
        const frames = paths[activeIndex];
        const visible = frames.filter((f) => f.t <= activeProgress);
        if (visible.length > 1) {
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.6;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(visible[0].x, visible[0].y);
          for (const f of visible.slice(1)) ctx.lineTo(f.x, f.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        const pos = interpolate(frames, activeProgress);
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    function runBall(i: number) {
      if (cancelled) return;
      if (i >= count) {
        setCurrentIndex(count);
        setTimeout(() => {
          if (!cancelled) onComplete();
        }, 300);
        return;
      }

      setCurrentIndex(i);
      const start = performance.now();

      function frame(now: number) {
        if (cancelled) return;
        const p = Math.min(1, (now - start) / perBallMs);
        drawFrame(i, p);

        if (p < 1) {
          raf = requestAnimationFrame(frame);
        } else {
          setRevealed((prev) => [...prev, { ...participants[i], orderNo: mapping[i] + 1 }]);
          pauseTimeout = setTimeout(() => runBall(i + 1), PAUSE_MS);
        }
      }

      raf = requestAnimationFrame(frame);
    }

    finishAllRef.current = () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (pauseTimeout) clearTimeout(pauseTimeout);
      drawFrame(count, 0);
      setRevealed(participants.map((p, i) => ({ ...p, orderNo: mapping[i] + 1 })));
      setCurrentIndex(count);
      setTimeout(onComplete, 200);
    };

    drawFrame(0, 0);
    runBall(0);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border bg-card">
        <div className="relative" style={{ width, height }}>
          <div className="absolute inset-x-0 top-0 flex" style={{ height: TOP_H }}>
            {participants.map((p, i) => (
              <div
                key={p.key}
                className={cn(
                  "absolute flex flex-col items-center gap-1 rounded-lg py-0.5 text-center transition-shadow",
                  i === currentIndex && !done && "ring-2 ring-primary",
                )}
                style={{ left: colX(i), transform: "translateX(-50%)", width: COL_W }}
              >
                <MemberAvatar name={p.name} photoUrl={p.photoUrl} className="size-9" />
                <span className="max-w-[60px] truncate text-[11px] font-medium">{p.name}</span>
              </div>
            ))}
          </div>

          <canvas
            ref={canvasRef}
            style={{ width, height, position: "absolute", top: 0, left: 0 }}
          />

          <div
            className="absolute inset-x-0 flex"
            style={{ top: TOP_H + ROW_H * rows, height: BOTTOM_H }}
          >
            {Array.from({ length: count }, (_, slot) => (
              <div
                key={slot}
                className="absolute flex items-center justify-center"
                style={{ left: colX(slot), transform: "translateX(-50%)", width: COL_W }}
              >
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                  {slot + 1}번
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {revealed.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {revealed.map((r) => (
            <span
              key={r.key}
              className="flex items-center gap-1.5 rounded-full border bg-card py-1 pr-2.5 pl-1 text-xs"
            >
              <MemberAvatar name={r.name} photoUrl={r.photoUrl} className="size-5" />
              {r.name} → {r.orderNo}번
            </span>
          ))}
        </div>
      )}

      {!done && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {participants[currentIndex]?.name}님이 사다리를 타는 중...
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => finishAllRef.current()}
          >
            전체 결과 바로 보기
          </Button>
        </div>
      )}
    </div>
  );
}
