"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VersePicker } from "@/features/bible-quiz/components/verse-picker";
import {
  DIFFICULTY_LABEL,
  difficultyForWordCount,
  type DifficultyOption,
} from "@/features/bible-quiz/lib/difficulty";
import { splitVerseWords } from "@/features/bible-quiz/lib/word-scramble";
import type { QuizVerse } from "@/features/bible-quiz/types";

const ALL_CATEGORY = "ALL";
const TIME_OPTIONS = [20, 30, 45, 60];
const DIFFICULTY_OPTIONS: DifficultyOption[] = ["EASY", "MEDIUM", "HARD", "MIXED"];

export type StartOptions =
  | { mode: "RANDOM"; categoryId: string; difficulty: DifficultyOption; count: number; timeLimitSec: number }
  | { mode: "MANUAL"; verseIds: string[]; difficulty: DifficultyOption; timeLimitSec: number };

export function QuizSetup({
  verses,
  categories,
  onStart,
}: {
  verses: QuizVerse[];
  categories: { id: string; name: string }[];
  onStart: (opts: StartOptions) => void;
}) {
  const [mode, setMode] = useState<"random" | "manual">("random");
  const [categoryId, setCategoryId] = useState(ALL_CATEGORY);
  const [difficulty, setDifficulty] = useState<DifficultyOption>("MIXED");
  const [count, setCount] = useState(5);
  const [timeLimitSec, setTimeLimitSec] = useState(30);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const categoryPool = useMemo(
    () => (categoryId === ALL_CATEGORY ? verses : verses.filter((v) => v.categoryId === categoryId)),
    [verses, categoryId],
  );

  const difficultyPool = useMemo(() => {
    if (difficulty === "MIXED") return categoryPool;
    return categoryPool.filter((v) => difficultyForWordCount(splitVerseWords(v.text).length) === difficulty);
  }, [categoryPool, difficulty]);

  const clampedCount = Math.max(1, Math.min(count, difficultyPool.length || 1));

  function toggleVerse(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "random" | "manual")}>
        <TabsList className="w-full">
          <TabsTrigger value="random" className="flex-1">
            랜덤 출제
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex-1">
            직접 선택
          </TabsTrigger>
        </TabsList>

        <TabsContent value="random" className="space-y-5 pt-4">
          <Card>
            <CardContent className="space-y-3">
              <Label>카테고리</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORY}>전체 ({verses.length}개)</SelectItem>
                  {categories.map((c) => {
                    const n = verses.filter((v) => v.categoryId === c.id).length;
                    return (
                      <SelectItem key={c.id} value={c.id} disabled={n === 0}>
                        {c.name} ({n}개)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <Label htmlFor="quiz-count">문제 개수</Label>
              <Input
                id="quiz-count"
                type="number"
                min={1}
                max={difficultyPool.length || 1}
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                선택한 조건에 구절 {difficultyPool.length}개가 있습니다.
              </p>
            </CardContent>
          </Card>

          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={difficultyPool.length === 0}
            onClick={() =>
              onStart({ mode: "RANDOM", categoryId, difficulty, count: clampedCount, timeLimitSec })
            }
          >
            <Sparkles className="size-4" />
            퀴즈 시작 ({clampedCount}문제)
          </Button>
          {difficultyPool.length === 0 && (
            <p className="text-center text-xs text-muted-foreground">
              이 조건에 맞는 구절이 없습니다. 카테고리나 난이도를 바꿔보세요.
            </p>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-5 pt-4">
          <Card>
            <CardContent className="space-y-3">
              <Label>구절 선택</Label>
              <VersePicker verses={verses} selectedIds={selectedIds} onToggle={toggleVerse} />
            </CardContent>
          </Card>

          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={selectedIds.size === 0}
            onClick={() =>
              onStart({ mode: "MANUAL", verseIds: Array.from(selectedIds), difficulty, timeLimitSec })
            }
          >
            <Sparkles className="size-4" />
            퀴즈 시작 ({selectedIds.size}문제)
          </Button>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="space-y-3">
          <Label>난이도</Label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyOption)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((d) => (
                <SelectItem key={d} value={d}>
                  {DIFFICULTY_LABEL[d]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            난이도가 낮을수록 단어를 더 많이 미리 채워줍니다. &ldquo;혼합&rdquo;은 문제마다 난이도를
            무작위로 섞습니다.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <Label>문제당 제한시간</Label>
          <Select value={String(timeLimitSec)} onValueChange={(v) => setTimeLimitSec(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}초
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Link
        href="/f/bible-quiz/questions"
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <Settings2 className="size-3.5" />
        구절 관리
      </Link>
    </div>
  );
}
