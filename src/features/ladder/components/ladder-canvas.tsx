"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/domain/member-avatar";
import { cn } from "@/lib/utils";
import type { Participant } from "@/features/ladder/types";
import { computeResultOrder, type LadderRung } from "@/features/ladder/lib/generate-ladder";

const BASE_METRICS = { colW: 64, rowH: 20, topH: 88, bottomH: 48, padX: 32 };
const FULLSCREEN_SCALE = 1.7;
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
type Metrics = { colW: number; rowH: number; topH: number; bottomH: number; padX: number };

function buildKeyframes(
  startIndex: number,
  rungsByRow: Set<number>[],
  rows: number,
  m: Metrics,
): Keyframe[] {
  const colX = (i: number) => m.padX + m.colW * i;
  const rowY = (r: number) => m.topH + m.rowH * r;

  const frames: Keyframe[] = [{ t: 0, x: colX(startIndex), y: rowY(0) }];
  let pos = startIndex;

  for (let row = 0; row < rows; row++) {
    const rowStartT = row / rows;
    const rowEndT = (row + 1) / rows;
    let newPos = pos;
    if (rungsByRow[row].has(pos)) newPos = pos + 1;
    else if (rungsByRow[row].has(pos - 1)) newPos = pos - 1;

    if (newPos !== pos) {
      const rungY = rowY(row) + m.rowH * 0.5;
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
  isFullscreen = false,
  onComplete,
}: {
  participants: Participant[];
  rungs: LadderRung[];
  rows: number;
  isFullscreen?: boolean;
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState<RevealedEntry[]>([]);
  const finishAllRef = useRef<() => void>(() => {});
  const count = participants.length;
  const done = currentIndex >= count;

  const scale = isFullscreen ? FULLSCREEN_SCALE : 1;
  const m: Metrics = {
    colW: BASE_METRICS.colW * scale,
    rowH: BASE_METRICS.rowH * scale,
    topH: BASE_METRICS.topH * scale,
    bottomH: BASE_METRICS.bottomH * scale,
    padX: BASE_METRICS.padX * scale,
  };
  const ballRadius = 8 * scale;
  const ballRadiusDone = 6 * scale;

  const colX = (i: number) => m.padX + m.colW * i;
  const rowY = (r: number) => m.topH + m.rowH * r;
  const width = m.padX * 2 + m.colW * (count - 1);
  const height = m.topH + m.rowH * rows + m.bottomH;
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
    () => participants.map((_, i) => buildKeyframes(i, rungsByRow, rows, m)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [participants, count, rungsByRow, rows, scale],
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
      ctx.lineWidth = 2 * scale;
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.moveTo(colX(i), rowY(0));
        ctx.lineTo(colX(i), rowY(rows));
        ctx.stroke();
      }

      // 가로줄
      ctx.strokeStyle = "rgba(15, 23, 42, 0.32)";
      ctx.lineWidth = 2.5 * scale;
      for (const r of rungs) {
        const y = rowY(r.row) + m.rowH * 0.5;
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
        ctx.arc(finalPos.x, finalPos.y, ballRadiusDone, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5 * scale;
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
          ctx.lineWidth = 3.5 * scale;
          ctx.beginPath();
          ctx.moveTo(visible[0].x, visible[0].y);
          for (const f of visible.slice(1)) ctx.lineTo(f.x, f.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        const pos = interpolate(frames, activeProgress);
        ctx.shadowColor = color;
        ctx.shadowBlur = 8 * scale;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2 * scale;
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
          <div className="absolute inset-x-0 top-0 flex" style={{ height: m.topH }}>
            {participants.map((p, i) => (
              <div
                key={p.key}
                className={cn(
                  "absolute flex flex-col items-center gap-1 rounded-lg py-0.5 text-center transition-shadow",
                  i === currentIndex && !done && "ring-2 ring-primary",
                )}
                style={{ left: colX(i), transform: "translateX(-50%)", width: m.colW }}
              >
                <MemberAvatar
                  name={p.name}
                  photoUrl={p.photoUrl}
                  style={{ width: 36 * scale, height: 36 * scale, fontSize: 14 * scale }}
                />
                <span
                  className="truncate font-medium"
                  style={{ maxWidth: m.colW - 4, fontSize: isFullscreen ? 15 * scale * 0.72 : 11 }}
                >
                  {p.name}
                </span>
              </div>
            ))}
          </div>

          <canvas
            ref={canvasRef}
            style={{ width, height, position: "absolute", top: 0, left: 0 }}
          />

          <div
            className="absolute inset-x-0 flex"
            style={{ top: m.topH + m.rowH * rows, height: m.bottomH }}
          >
            {Array.from({ length: count }, (_, slot) => (
              <div
                key={slot}
                className="absolute flex items-center justify-center"
                style={{ left: colX(slot), transform: "translateX(-50%)", width: m.colW }}
              >
                <span
                  className="rounded-full bg-muted font-semibold"
                  style={{
                    padding: isFullscreen ? "0.4em 0.9em" : undefined,
                    fontSize: isFullscreen ? 15 * scale * 0.6 : 12,
                  }}
                >
                  {slot + 1}번
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {revealed.length > 0 && (
        <div className={cn("flex flex-wrap gap-2", isFullscreen && "gap-3")}>
          {revealed.map((r) => (
            <span
              key={r.key}
              className={cn(
                "flex items-center gap-1.5 rounded-full border bg-card py-1 pr-2.5 pl-1",
                isFullscreen ? "gap-2.5 py-2 pr-4 pl-1.5 text-lg sm:text-xl" : "text-xs",
              )}
            >
              <MemberAvatar
                name={r.name}
                photoUrl={r.photoUrl}
                className={isFullscreen ? "size-9 sm:size-10" : "size-5"}
              />
              {r.name} → {r.orderNo}번
            </span>
          ))}
        </div>
      )}

      {!done && (
        <div className="flex items-center justify-between">
          <p className={cn("text-muted-foreground", isFullscreen ? "text-lg sm:text-xl" : "text-xs")}>
            {participants[currentIndex]?.name}님이 사다리를 타는 중...
          </p>
          <Button
            type="button"
            variant="outline"
            size={isFullscreen ? "default" : "sm"}
            onClick={() => finishAllRef.current()}
          >
            전체 결과 바로 보기
          </Button>
        </div>
      )}
    </div>
  );
}
