import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getQuizCategories } from "@/lib/quiz";
import { CategoryQuickAdd } from "./category-quick-add";
import { VerseFormDialog } from "./verse-form-dialog";
import { BulkImportDialog } from "./bulk-import-dialog";
import { VerseCard } from "./verse-card";

export default async function BibleQuizQuestionsPage() {
  const [categories, verses] = await Promise.all([
    getQuizCategories(),
    db.quizQuestion.findMany({
      where: { type: "WORD_ORDER", isActive: true },
      orderBy: { reference: "asc" },
    }),
  ]);

  const editableVerses = verses.map((v) => ({
    id: v.id,
    reference: v.reference ?? v.question,
    text: v.answer,
    categoryId: v.categoryId,
  }));

  const unassigned = editableVerses.filter((v) => !v.categoryId);
  const byCategory = categories
    .map((c) => ({ category: c, verses: editableVerses.filter((v) => v.categoryId === c.id) }))
    .filter((entry) => entry.verses.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          구절 {verses.length}개 · 카테고리 {categories.length}개
        </p>
        <div className="flex flex-wrap gap-2">
          <CategoryQuickAdd />
          <BulkImportDialog />
          <VerseFormDialog categories={categories} />
        </div>
      </div>

      {verses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            아직 등록된 구절이 없습니다. &ldquo;구절 추가&rdquo; 또는 &ldquo;마크다운 일괄
            가져오기&rdquo;로 등록해보세요.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {byCategory.map(({ category, verses }) => (
            <section key={category.id} className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                {category.name}
                <Badge variant="secondary">{verses.length}개</Badge>
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {verses.map((v) => (
                  <VerseCard key={v.id} verse={v} categories={categories} />
                ))}
              </div>
            </section>
          ))}

          {unassigned.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                미분류
                <Badge variant="secondary">{unassigned.length}개</Badge>
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unassigned.map((v) => (
                  <VerseCard key={v.id} verse={v} categories={categories} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
