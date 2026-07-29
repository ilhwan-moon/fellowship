"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const NEW_CATEGORY_VALUE = "__new_category__";
export const NO_CATEGORY_VALUE = "__no_category__";

export function VerseFormFields({
  reference,
  onReferenceChange,
  text,
  onTextChange,
  categoryId,
  onCategoryIdChange,
  categories,
  newCategoryName,
  onNewCategoryNameChange,
}: {
  reference: string;
  onReferenceChange: (v: string) => void;
  text: string;
  onTextChange: (v: string) => void;
  categoryId: string;
  onCategoryIdChange: (v: string) => void;
  categories: { id: string; name: string }[];
  newCategoryName: string;
  onNewCategoryNameChange: (v: string) => void;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="verse-reference">구절 참조</Label>
        <Input
          id="verse-reference"
          value={reference}
          onChange={(e) => onReferenceChange(e.target.value)}
          placeholder="예: 요한복음 3:16"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="verse-text">구절 본문</Label>
        <Textarea
          id="verse-text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="하나님이 세상을 이처럼 사랑하사..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>카테고리</Label>
        <Select value={categoryId} onValueChange={onCategoryIdChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CATEGORY_VALUE}>미분류</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
            <SelectItem value={NEW_CATEGORY_VALUE}>+ 새 카테고리 만들기</SelectItem>
          </SelectContent>
        </Select>
        {categoryId === NEW_CATEGORY_VALUE && (
          <Input
            autoFocus
            value={newCategoryName}
            onChange={(e) => onNewCategoryNameChange(e.target.value)}
            placeholder="새 카테고리 이름"
            className="mt-2"
          />
        )}
      </div>
    </>
  );
}
