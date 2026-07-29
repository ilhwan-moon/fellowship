"use client";

import { useState, useTransition } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFullscreen } from "@/lib/use-fullscreen";
import { shuffled } from "@/lib/shuffle";
import { QuizSetup, type StartOptions } from "@/features/bible-quiz/components/quiz-setup";
import { QuizPlay } from "@/features/bible-quiz/components/quiz-play";
import { QuizResult } from "@/features/bible-quiz/components/quiz-result";
import { saveQuizRun } from "@/features/bible-quiz/actions";
import { difficultyForWordCount, randomDifficulty, type Difficulty } from "@/features/bible-quiz/lib/difficulty";
import { splitVerseWords } from "@/features/bible-quiz/lib/word-scramble";
import type { QuizAnswerResult, QuizVerse } from "@/features/bible-quiz/types";

type Step = "SETUP" | "PLAY" | "RESULT";
type Question = { verse: QuizVerse; difficulty: Difficulty };

function resolveDifficulty(verse: QuizVerse, chosen: StartOptions["difficulty"]): Difficulty {
  if (chosen === "MIXED") return randomDifficulty();
  return chosen;
}

export function QuizGame({
  verses,
  categories,
}: {
  verses: QuizVerse[];
  categories: { id: string; name: string }[];
}) {
  const [step, setStep] = useState<Step>("SETUP");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [timeLimitSec, setTimeLimitSec] = useState(30);
  const [results, setResults] = useState<QuizAnswerResult[]>([]);
  const [, startSaving] = useTransition();

  const { ref: containerRef, isFullscreen, toggle: toggleFullscreen } = useFullscreen<HTMLDivElement>();

  function handleStart(opts: StartOptions) {
    let picked: QuizVerse[];

    if (opts.mode === "MANUAL") {
      const byId = new Map(verses.map((v) => [v.id, v]));
      picked = shuffled(opts.verseIds.map((id) => byId.get(id)).filter((v): v is QuizVerse => !!v));
    } else {
      const categoryPool = opts.categoryId === "ALL" ? verses : verses.filter((v) => v.categoryId === opts.categoryId);
      const pool =
        opts.difficulty === "MIXED"
          ? categoryPool
          : categoryPool.filter((v) => difficultyForWordCount(splitVerseWords(v.text).length) === opts.difficulty);
      picked = shuffled(pool).slice(0, opts.count);
    }

    setQuestions(picked.map((verse) => ({ verse, difficulty: resolveDifficulty(verse, opts.difficulty) })));
    setTimeLimitSec(opts.timeLimitSec);
    setResults([]);
    setIndex(0);
    setStep("PLAY");
  }

  function handleAnswered(result: QuizAnswerResult) {
    // 같은 문제를 "다시 풀기"로 재도전한 경우, 이전 기록을 최신 결과로 덮어쓴다.
    setResults((prev) => {
      const existingIndex = prev.findIndex((r) => r.questionId === result.questionId);
      if (existingIndex === -1) return [...prev, result];
      const next = [...prev];
      next[existingIndex] = result;
      return next;
    });
  }

  function handleNext() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      return;
    }
    setStep("RESULT");
    startSaving(async () => {
      await saveQuizRun({ results: [...results] });
    });
  }

  function handleRestart() {
    setStep("SETUP");
    setQuestions([]);
    setResults([]);
    setIndex(0);
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "space-y-5",
        isFullscreen && "flex min-h-full flex-col overflow-y-auto bg-background p-6",
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {step === "SETUP" && "성경퀴즈 설정"}
          {step === "PLAY" && "성경퀴즈"}
          {step === "RESULT" && "결과"}
        </h2>
        <Button type="button" variant="outline" size="icon-sm" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          <span className="sr-only">전체화면 전환</span>
        </Button>
      </div>

      {step === "SETUP" && (
        <QuizSetup verses={verses} categories={categories} onStart={handleStart} />
      )}

      {step === "PLAY" && questions[index] && (
        <QuizPlay
          key={questions[index].verse.id}
          verse={questions[index].verse}
          difficulty={questions[index].difficulty}
          index={index}
          total={questions.length}
          timeLimitSec={timeLimitSec}
          isFullscreen={isFullscreen}
          onAnswered={handleAnswered}
          onNext={handleNext}
        />
      )}

      {step === "RESULT" && (
        <QuizResult results={results} isFullscreen={isFullscreen} onRestart={handleRestart} />
      )}
    </div>
  );
}
