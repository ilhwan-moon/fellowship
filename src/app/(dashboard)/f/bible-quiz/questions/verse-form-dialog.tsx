"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  VerseFormFields,
  NEW_CATEGORY_VALUE,
  NO_CATEGORY_VALUE,
} from "./verse-form-fields";
import { createCategory, createVerse } from "./actions";

export function VerseFormDialog({ categories }: { categories: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState(NO_CATEGORY_VALUE);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setReference("");
    setText("");
    setCategoryId(NO_CATEGORY_VALUE);
    setNewCategoryName("");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      let finalCategoryId: string | undefined;

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

      const result = await createVerse({ reference, text, categoryId: finalCategoryId });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      reset();
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          구절 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>구절 추가</DialogTitle>
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

          <DialogFooter>
            <Button type="submit" disabled={pending || !reference.trim() || !text.trim()}>
              {pending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
