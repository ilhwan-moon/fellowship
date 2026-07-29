"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuizAnswerResult } from "@/features/bible-quiz/types";

export function QuizResult({
  results,
  isFullscreen,
  onRestart,
}: {
  results: QuizAnswerResult[];
  isFullscreen: boolean;
  onRestart: () => void;
}) {
  const correct = results.filter((r) => r.isCorrect).length;
  const wrongCount = results.length - correct;

  return (
    <div className={cn("space-y-6", isFullscreen && "flex flex-col justify-center")}>
      <div className="text-center">
        <p
          className={cn("font-bold", isFullscreen ? "" : "text-4xl")}
          style={isFullscreen ? { fontSize: "clamp(3rem, 9vmin, 7rem)" } : undefined}
        >
          {correct} / {results.length}
        </p>
        <p className={cn("text-muted-foreground", isFullscreen ? "text-xl sm:text-2xl" : "text-sm")}>
          정답을 맞혔습니다 {wrongCount > 0 && `· 오답 ${wrongCount}문제`}
        </p>
      </div>

      <div className="divide-y overflow-hidden rounded-xl border">
        {results.map((r) => (
          <div key={r.questionId} className="flex items-center gap-3 px-4 py-3">
            {r.isCorrect ? (
              <Check className="size-4 shrink-0 text-emerald-600" />
            ) : (
              <X className="size-4 shrink-0 text-destructive" />
            )}
            <span className="text-sm font-medium">{r.reference}</span>
            {!r.isCorrect && r.wrongCount > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">틀린 곳 {r.wrongCount}개</span>
            )}
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={onRestart}>
        새 퀴즈 시작
      </Button>
    </div>
  );
}
