"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  VerseFormFields,
  NEW_CATEGORY_VALUE,
  NO_CATEGORY_VALUE,
} from "./verse-form-fields";
import { createCategory, deactivateVerse, updateVerse } from "./actions";

export type EditableVerse = {
  id: string;
  reference: string;
  text: string;
  categoryId: string | null;
};

export function VerseEditDialog({
  verse,
  categories,
  open,
  onOpenChange,
}: {
  verse: EditableVerse;
  categories: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reference, setReference] = useState(verse.reference);
  const [text, setText] = useState(verse.text);
  const [categoryId, setCategoryId] = useState(verse.categoryId ?? NO_CATEGORY_VALUE);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function syncFromVerse() {
    setReference(verse.reference);
    setText(verse.text);
    setCategoryId(verse.categoryId ?? NO_CATEGORY_VALUE);
    setNewCategoryName("");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      let finalCategoryId: string | null = null;

      if (categoryId === NEW_CATEGORY_VALUE) {
        if (!newCategoryName.trim()) {
          setError("새 카테고리 이름을 입력해주세요.");
          return;
        }
        const categoryResult = await createCategory(newCategoryName);
        if (!categoryResult.ok) {
          setError(categoryResult.error);
          return;
        }
        finalCategoryId = categoryResult.category.id;
      } else if (categoryId !== NO_CATEGORY_VALUE) {
        finalCategoryId = categoryId;
      }

      const result = await updateVerse(verse.id, {
        reference,
        text,
        categoryId: finalCategoryId,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
    });
  }

  function handleDeactivate() {
    if (!confirm(`"${verse.reference}" 구절을 비활성화할까요?`)) return;
    startTransition(async () => {
      await deactivateVerse(verse.id);
      onOpenChange(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) syncFromVerse();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>구절 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <VerseFormFields
            reference={reference}
            onReferenceChange={setReference}
            text={text}
            onTextChange={setText}
            categoryId={categoryId}
            onCategoryIdChange={setCategoryId}
            categories={categories}
            newCategoryName={newCategoryName}
            onNewCategoryNameChange={setNewCategoryName}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={handleDeactivate}
              disabled={pending}
            >
              구절 비활성화
            </Button>
            <Button type="submit" disabled={pending || !reference.trim() || !text.trim()}>
              {pending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
