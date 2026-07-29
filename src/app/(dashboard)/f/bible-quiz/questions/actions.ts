"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

export async function createCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false as const, error: "카테고리 이름을 입력해주세요." };

  const existing = await db.quizCategory.findUnique({ where: { name: trimmed } });
  if (existing) return { ok: true as const, category: existing };

  const category = await db.quizCategory.create({ data: { name: trimmed } });
  revalidatePath("/f/bible-quiz/questions");
  return { ok: true as const, category };
}

export async function deleteCategory(id: string) {
  const count = await db.quizQuestion.count({ where: { categoryId: id } });
  if (count > 0) {
    return { ok: false as const, error: `이 카테고리에 구절이 ${count}개 있어 삭제할 수 없습니다.` };
  }
  await db.quizCategory.delete({ where: { id } });
  revalidatePath("/f/bible-quiz/questions");
  return { ok: true as const };
}

const verseSchema = z.object({
  reference: z.string().trim().min(1, "구절 참조를 입력해주세요.").max(100),
  text: z.string().trim().min(1, "구절 본문을 입력해주세요."),
  categoryId: z.string().nullable().optional(),
});

export async function createVerse(input: {
  reference: string;
  text: string;
  categoryId?: string | null;
}) {
  const parsed = verseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { reference, text, categoryId } = parsed.data;
  const question = await db.quizQuestion.create({
    data: {
      type: "WORD_ORDER",
      question: reference,
      answer: text,
      reference,
      choices: [],
      categoryId: categoryId ?? undefined,
    },
  });

  revalidatePath("/f/bible-quiz/questions");
  return { ok: true as const, question };
}

export async function updateVerse(
  id: string,
  input: { reference: string; text: string; categoryId?: string | null },
) {
  const parsed = verseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { reference, text, categoryId } = parsed.data;
  const question = await db.quizQuestion.update({
    where: { id },
    data: { question: reference, answer: text, reference, categoryId: categoryId ?? null },
  });

  revalidatePath("/f/bible-quiz/questions");
  return { ok: true as const, question };
}

export async function deactivateVerse(id: string) {
  await db.quizQuestion.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/f/bible-quiz/questions");
  return { ok: true as const };
}

export async function bulkImportVerses(
  rows: { category: string; reference: string; text: string }[],
) {
  if (rows.length === 0) return { ok: false as const, error: "가져올 구절이 없습니다." };

  const categoryNameToId = new Map<string, string>();
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const categoryName = row.category.trim();
    if (!categoryNameToId.has(categoryName)) {
      const existing = await db.quizCategory.findUnique({ where: { name: categoryName } });
      const category = existing ?? (await db.quizCategory.create({ data: { name: categoryName } }));
      categoryNameToId.set(categoryName, category.id);
    }
    const categoryId = categoryNameToId.get(categoryName)!;

    const dup = await db.quizQuestion.findFirst({
      where: { type: "WORD_ORDER", reference: row.reference, categoryId },
    });
    if (dup) {
      skipped++;
      continue;
    }

    await db.quizQuestion.create({
      data: {
        type: "WORD_ORDER",
        question: row.reference,
        answer: row.text,
        reference: row.reference,
        choices: [],
        categoryId,
      },
    });
    created++;
  }

  revalidatePath("/f/bible-quiz/questions");
  return { ok: true as const, created, skipped };
}
