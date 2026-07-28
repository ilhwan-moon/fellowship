"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Maximize, Minimize, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MemberAvatar } from "@/components/domain/member-avatar";
import { MemberPicker } from "@/features/ladder/components/member-picker";
import { GuestAdder } from "@/features/ladder/components/guest-adder";
import { LadderCanvas } from "@/features/ladder/components/ladder-canvas";
import { ResultView } from "@/features/ladder/components/result-view";
import { saveLadderRun } from "@/features/ladder/actions";
import {
  computeResultOrder,
  generateRungs,
  rowsForCount,
  shuffled,
  type LadderRung,
} from "@/features/ladder/lib/generate-ladder";
import type { LadderResultEntry, Participant } from "@/features/ladder/types";
import { cn } from "@/lib/utils";

type Step = "SETUP" | "ANIMATING" | "RESULT";

export function LadderGame({ initialMembers }: { initialMembers: Participant[] }) {
  const [step, setStep] = useState<Step>("SETUP");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [guests, setGuests] = useState<Participant[]>([]);
  const [title, setTitle] = useState("");

  const [gameParticipants, setGameParticipants] = useState<Participant[]>([]);
  const [rows, setRows] = useState(0);
  const [rungs, setRungs] = useState<LadderRung[]>([]);
  const [resultEntries, setResultEntries] = useState<LadderResultEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const [, startSaving] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      // 브라우저가 전체화면 요청을 거부한 경우 (권한 정책 등) - 조용히 무시
    }
  }

  const selectedMembers = useMemo(
    () => initialMembers.filter((m) => selectedKeys.has(m.key)),
    [initialMembers, selectedKeys],
  );
  const participants = useMemo(() => [...selectedMembers, ...guests], [selectedMembers, guests]);

  function toggleMember(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleGroup(keys: string[], select: boolean) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const key of keys) {
        if (select) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  }

  function removeParticipant(key: string) {
    setSelectedKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setGuests((prev) => prev.filter((g) => g.key !== key));
  }

  function startGame() {
    if (participants.length < 2) return;
    const order = shuffled(participants);
    const rowCount = rowsForCount(order.length);
    setGameParticipants(order);
    setRows(rowCount);
    setRungs(generateRungs(order.length, rowCount));
    setSaved(false);
    setStep("ANIMATING");
  }

  function handleAnimationComplete() {
    const mapping = computeResultOrder(gameParticipants.length, rungs, rows);
    const entries: LadderResultEntry[] = gameParticipants.map((p, startIndex) => ({
      ...p,
      orderNo: mapping[startIndex] + 1,
    }));
    entries.sort((a, b) => a.orderNo - b.orderNo);
    setResultEntries(entries);
    setStep("RESULT");

    startSaving(async () => {
      const result = await saveLadderRun({ title, result: entries });
      if (result.ok) setSaved(true);
    });
  }

  function resetAll() {
    setStep("SETUP");
    setSelectedKeys(new Set());
    setGuests([]);
    setTitle("");
    setResultEntries([]);
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "space-y-5",
        isFullscreen && "flex min-h-full flex-col justify-center overflow-y-auto bg-background p-6",
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {step === "SETUP" && "참가자 설정"}
          {step === "ANIMATING" && "사다리 타는 중..."}
          {step === "RESULT" && "간증 순서 결과"}
        </h2>
        <Button type="button" variant="outline" size="icon-sm" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          <span className="sr-only">전체화면 전환</span>
        </Button>
      </div>

      {step === "SETUP" && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="run-title">제목 (선택)</Label>
            <Input
              id="run-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 7월 청년부 간증 순서"
            />
          </div>

          <Card>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium">등록된 성도에서 선택</p>
              <MemberPicker
                members={initialMembers}
                selectedKeys={selectedKeys}
                onToggle={toggleMember}
                onToggleGroup={toggleGroup}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium">명단에 없는 참가자 추가</p>
              <GuestAdder onAdd={(g) => setGuests((prev) => [...prev, g])} />
            </CardContent>
          </Card>

          {participants.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                참가자 미리보기 <span className="text-muted-foreground">({participants.length}명)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => (
                  <span
                    key={p.key}
                    className="flex items-center gap-1.5 rounded-full border bg-card py-1 pr-1 pl-1.5 text-sm"
                  >
                    <MemberAvatar name={p.name} photoUrl={p.photoUrl} className="size-6" />
                    {p.name}
                    <button
                      type="button"
                      onClick={() => removeParticipant(p.key)}
                      className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={participants.length < 2}
            onClick={startGame}
          >
            <Shuffle className="size-4" />
            사다리 타기 시작 ({participants.length}명)
          </Button>
          {participants.length < 2 && (
            <p className="text-center text-xs text-muted-foreground">
              최소 2명 이상 선택해주세요.
            </p>
          )}
        </div>
      )}

      {step === "ANIMATING" && (
        <LadderCanvas
          participants={gameParticipants}
          rungs={rungs}
          rows={rows}
          onComplete={handleAnimationComplete}
        />
      )}

      {step === "RESULT" && (
        <div className="space-y-4">
          <ResultView entries={resultEntries} />
          <p className="text-center text-xs text-muted-foreground">
            {saved ? "진행 이력에 저장되었습니다." : "저장 중..."}
          </p>
          <Button type="button" variant="outline" className="w-full" onClick={resetAll}>
            새 게임 시작
          </Button>
        </div>
      )}
    </div>
  );
}
