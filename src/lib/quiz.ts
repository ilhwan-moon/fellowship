import { db } from "@/lib/db";

export async function getQuizCategories() {
  return db.quizCategory.findMany({ orderBy: { name: "asc" } });
}

export async function getWordOrderQuestions() {
  return db.quizQuestion.findMany({
    where: { type: "WORD_ORDER", isActive: true },
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { reference: "asc" }],
  });
}
