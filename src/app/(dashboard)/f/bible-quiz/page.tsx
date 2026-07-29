import { getQuizCategories, getWordOrderQuestions } from "@/lib/quiz";
import { QuizGame } from "@/features/bible-quiz/components/quiz-game";
import type { QuizVerse } from "@/features/bible-quiz/types";

export default async function BibleQuizPage() {
  const [categories, questions] = await Promise.all([getQuizCategories(), getWordOrderQuestions()]);

  const verses: QuizVerse[] = questions.map((q) => ({
    id: q.id,
    reference: q.reference ?? q.question,
    text: q.answer,
    categoryId: q.categoryId,
    categoryName: q.category?.name ?? null,
  }));

  return <QuizGame verses={verses} categories={categories} />;
}
