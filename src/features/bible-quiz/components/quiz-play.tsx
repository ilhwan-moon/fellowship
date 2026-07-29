"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { shuffled } from "@/lib/shuffle";
import {
  buildScramble,
  checkSlots,
  type WordToken,
} from "@/features/bible-quiz/lib/word-scramble";
import { HINT_RATIO, type Difficulty } from "@/features/bible-quiz/lib/difficulty";
import type { QuizAnswerResult, QuizVerse } from "@/features/bible-quiz/types";

const PEEK_MS = 1500;

export function QuizPlay({
  verse,
  difficulty,
  index,
  total,
  timeLimitSec,
  isFullscreen,
  onAnswered,
  onNext,
}: {
  verse: QuizVerse;
  difficulty: Difficulty;
  index: number;
  total: number;
  timeLimitSec: number;
  isFullscreen: boolean;
  onAnswered: (result: QuizAnswerResult) => void;
  onNext: () => void;
}) {
  const [scramble, setScramble] = useState(() => buildScramble(verse.text, HINT_RATIO[difficulty]));
  const [filledWords, setFilledWords] = useState<WordToken[]>([]);
  const [pool, setPool] = useState<WordToken[]>(() => scramble.pool);
  const [remaining, setRemaining] = useState(timeLimitSec);
  const [revealed, setRevealed] = useState(false);
  const [wrongPositions, setWrongPositions] = useState<number[]>([]);
  const [correct, setCorrect] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const startRef = useRef(0);
  const submittedRef = useRef(false);
  const peekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const next = buildScramble(verse.text, HINT_RATIO[difficulty]);
    setScramble(next);
    setPool(next.pool);
    setFilledWords([]);
    setRemaining(timeLimitSec);
    setRevealed(false);
    setWrongPositions([]);
    setCorrect(false);
    setPeeking(false);
    startRef.current = performance.now();
    submittedRef.current = false;
    if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse.id]);

  useEffect(() => {
    return () => {
      if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (revealed || peeking) return;
    const id = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : r));
    }, 1000);
    return () => clearInterval(id);
  }, [revealed, peeking, verse.id]);

  useEffect(() => {
    if (!revealed && remaining === 0) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, revealed]);

  function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const result = checkSlots(scramble.slots, scramble.blankPositions, filledWords);
    setCorrect(result.isCorrect);
    setWrongPositions(result.wrongPositions);
    setRevealed(true);
    onAnswered({
      questionId: verse.id,
      reference: verse.reference,
      given: filledWords.map((t) => t.text).join(" "),
      isCorrect: result.isCorrect,
      wrongCount: result.wrongPositions.length,
      elapsedMs: performance.now() - startRef.current,
    });
  }

  function placeWord(token: WordToken) {
    if (revealed || filledWords.length >= scramble.blankPositions.length) return;
    setFilledWords((prev) => (prev.some((t) => t.id === token.id) ? prev : [...prev, token]));
    setPool((prev) => prev.filter((t) => t.id !== token.id));
  }

  function undoLast() {
    if (revealed || filledWords.length === 0) return;
    const last = filledWords[filledWords.length - 1];
    setFilledWords((prev) => prev.slice(0, -1));
    setPool((prev) => (prev.some((t) => t.id === last.id) ? prev : [...prev, last]));
  }

  function handlePeekReset() {
    if (revealed || peeking) return;
    setPeeking(true);
    peekTimeoutRef.current = setTimeout(() => {
      setPool((prev) => shuffled([...prev, ...filledWords]));
      setFilledWords([]);
      setPeeking(false);
    }, PEEK_MS);
  }

  const allFilled = filledWords.length === scramble.blankPositions.length;
  const wrongSet = new Set(wrongPositions);

  return (
    <div className={cn("space-y-5", isFullscreen && "flex flex-col justify-center gap-8")}>
      <div className="flex items-center justify-between">
        <span className={cn("font-medium text-muted-foreground", isFullscreen ? "text-2xl sm:text-3xl" : "text-sm")}>
          {index + 1} / {total}번째 문제
        </span>
        <span
          className={cn(
            "rounded-full px-3 py-1 font-mono font-bold tabular-nums",
            remaining <= 5 ? "bg-destructive/10 text-destructive" : "bg-muted",
          )}
          style={isFullscreen ? { fontSize: "clamp(1.75rem, 5vmin, 3.5rem)" } : undefined}
        >
          {remaining}초
        </span>
      </div>

      <p
        className={cn("text-center font-semibold", isFullscreen ? "" : "text-lg")}
        style={isFullscreen ? { fontSize: "clamp(1.5rem, 4vmin, 2.75rem)" } : undefined}
      >
        {verse.reference}
      </p>

      {peeking ? (
        <div className="flex min-h-16 items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 animate-in fade-in zoom-in-95 duration-300">
          <p
            className={cn("text-center font-medium", isFullscreen ? "" : "text-base")}
            style={isFullscreen ? { fontSize: "clamp(1.2rem, 3vmin, 2.25rem)" } : undefined}
          >
            {verse.text}
          </p>
        </div>
      ) : (
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-dashed p-3">
        {scramble.slots.map((slot) => {
          if (slot.isHint) {
            return (
              <span
                key={slot.position}
                className={cn("rounded-lg bg-muted/70 px-3 py-1.5 font-medium text-muted-foreground", isFullscreen ? "" : "text-sm")}
                style={isFullscreen ? { fontSize: "clamp(1.1rem, 2.6vmin, 2rem)" } : undefined}
              >
                {slot.correctText}
              </span>
            );
          }

          const blankRank = scramble.blankPositions.indexOf(slot.position);
          const filled = blankRank < filledWords.length ? filledWords[blankRank] : null;
          const isLast = revealed ? false : blankRank === filledWords.length - 1;
          const isWrong = revealed && wrongSet.has(slot.position);

          if (!filled) {
            return (
              <span
                key={slot.position}
                className={cn(
                  "rounded-lg border border-dashed px-3 py-1.5 text-muted-foreground/50",
                  isFullscreen ? "" : "text-sm",
                  revealed && "border-destructive/50 text-destructive",
                )}
                style={isFullscreen ? { fontSize: "clamp(1.1rem, 2.6vmin, 2rem)" } : undefined}
              >
                {revealed ? slot.correctText : "____"}
              </span>
            );
          }

          return (
            <button
              key={slot.position}
              type="button"
              onClick={isLast ? undoLast : undefined}
              disabled={revealed || !isLast}
              className={cn(
                "rounded-lg px-3 py-1.5 font-medium text-primary-foreground",
                revealed ? (isWrong ? "bg-destructive" : "bg-emerald-600") : "bg-primary",
                isFullscreen ? "" : "text-sm",
              )}
              style={isFullscreen ? { fontSize: "clamp(1.1rem, 2.6vmin, 2rem)" } : undefined}
            >
              {filled.text}
            </button>
          );
        })}
      </div>
      )}

      <div
        className={cn(
          "flex flex-wrap gap-2 transition-opacity duration-300",
          peeking && "pointer-events-none opacity-0",
        )}
      >
        {pool.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => placeWord(t)}
            disabled={revealed || peeking}
            className={cn(
              "rounded-lg border bg-card px-3 py-1.5 font-medium hover:bg-muted",
              isFullscreen ? "" : "text-sm",
            )}
            style={isFullscreen ? { fontSize: "clamp(1.1rem, 2.6vmin, 2rem)" } : undefined}
          >
            {t.text}
          </button>
        ))}
      </div>

      {revealed ? (
        <div className="space-y-3">
          <div
            className={cn(
              "flex items-center gap-2 font-semibold",
              correct ? "text-emerald-600" : "text-destructive",
              isFullscreen ? "text-2xl sm:text-3xl" : "text-base",
            )}
          >
            {correct ? <Check className="size-6" /> : <X className="size-6" />}
            {correct ? "정답입니다!" : `아쉬워요 (오답 ${wrongPositions.length}곳)`}
          </div>
          <p
            className={cn("rounded-lg bg-muted p-3", isFullscreen ? "" : "text-sm")}
            style={isFullscreen ? { fontSize: "clamp(1.1rem, 2.8vmin, 2rem)" } : undefined}
          >
            {verse.text}
          </p>
          <Button type="button" size={isFullscreen ? "lg" : "default"} className="w-full" onClick={onNext}>
            {index + 1 === total ? "결과 보기" : "다음 문제"}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handlePeekReset} disabled={peeking}>
            <Eye className="size-4" />
            정답 잠깐 보기
          </Button>
          <Button type="button" className="flex-1" disabled={!allFilled || peeking} onClick={submit}>
            정답 확인
          </Button>
        </div>
      )}
    </div>
  );
}
