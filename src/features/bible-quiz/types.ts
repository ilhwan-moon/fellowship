export type QuizVerse = {
  id: string;
  reference: string;
  text: string;
  categoryId: string | null;
  categoryName: string | null;
};

export type QuizAnswerResult = {
  questionId: string;
  reference: string;
  given: string;
  isCorrect: boolean;
  wrongCount: number;
  elapsedMs: number;
};
