export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type DifficultyOption = Difficulty | "MIXED";

export const DIFFICULTY_LABEL: Record<DifficultyOption, string> = {
  EASY: "쉬움",
  MEDIUM: "보통",
  HARD: "어려움",
  MIXED: "혼합",
};

/** 힌트로 미리 채워줄 단어 비율 (나머지는 빈칸으로 남아 채워야 함) */
export const HINT_RATIO: Record<Difficulty, number> = {
  EASY: 0.5,
  MEDIUM: 0.25,
  HARD: 0,
};

/** 구절 길이(단어 수)로 난이도 등급을 매긴다. (절 단위 기준 25/50/75 백분위) */
export function difficultyForWordCount(wordCount: number): Difficulty {
  if (wordCount <= 11) return "EASY";
  if (wordCount <= 18) return "MEDIUM";
  return "HARD";
}

export function randomDifficulty(): Difficulty {
  const options: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
  return options[Math.floor(Math.random() * options.length)];
}
