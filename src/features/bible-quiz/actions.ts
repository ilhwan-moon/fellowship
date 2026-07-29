"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { QuizAnswerResult } from "@/features/bible-quiz/types";

export async function saveQuizRun(input: { title?: string; results: QuizAnswerResult[] }) {
  const correct = input.results.filter((r) => r.isCorrect).length;
  const total = input.results.length;

  const run = await db.activityRun.create({
    data: {
      featureSlug: "bible-quiz",
      title: input.title || null,
      status: "DONE",
      endedAt: new Date(),
      config: { questionCount: total },
      result: { correct, total, entries: input.results },
      answers: {
        create: input.results.map((r) => ({
          questionId: r.questionId,
          given: r.given,
          isCorrect: r.isCorrect,
          elapsedMs: Math.round(r.elapsedMs),
        })),
      },
    },
  });

  revalidatePath("/history");
  revalidatePath("/");
  return { ok: true as const, runId: run.id, correct, total };
}
