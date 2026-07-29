import { shuffled } from "@/lib/shuffle";

export type WordToken = { id: string; text: string };

export type Slot = {
  position: number;
  correctText: string;
  isHint: boolean;
};

export type ScrambleResult = {
  slots: Slot[];
  pool: WordToken[];
  blankPositions: number[];
};

export function splitVerseWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * 구절을 슬롯(정답 위치)으로 나누고, hintRatio 비율만큼은 미리 정답으로 채워둔다.
 * 나머지 빈칸은 pool에서 순서대로 골라 채워야 한다.
 */
export function buildScramble(text: string, hintRatio: number): ScrambleResult {
  const words = splitVerseWords(text);
  const total = words.length;
  const hintCount = Math.min(total - 1, Math.round(total * hintRatio));

  const allPositions = Array.from({ length: total }, (_, i) => i);
  const hintPositions = new Set(shuffled(allPositions).slice(0, Math.max(0, hintCount)));

  const slots: Slot[] = words.map((w, i) => ({
    position: i,
    correctText: w,
    isHint: hintPositions.has(i),
  }));

  const blankPositions = slots.filter((s) => !s.isHint).map((s) => s.position);

  const pool = shuffled(
    blankPositions.map((pos) => ({ id: `${pos}-${words[pos]}`, text: words[pos] })),
  );

  return { slots, pool, blankPositions };
}

export type CheckResult = {
  isCorrect: boolean;
  wrongPositions: number[];
};

/** 채워진 단어(filledWords, 빈칸 순서대로)를 정답과 위치별로 비교한다. */
export function checkSlots(slots: Slot[], blankPositions: number[], filledWords: WordToken[]): CheckResult {
  const wrongPositions: number[] = [];
  blankPositions.forEach((pos, i) => {
    const given = filledWords[i];
    const correctText = slots[pos].correctText;
    if (!given || given.text !== correctText) {
      wrongPositions.push(pos);
    }
  });
  return { isCorrect: wrongPositions.length === 0, wrongPositions };
}
