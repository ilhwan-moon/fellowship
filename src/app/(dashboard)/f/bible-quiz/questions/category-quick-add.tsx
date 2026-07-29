"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory } from "./actions";

export function CategoryQuickAdd() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCategory(name);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setName("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="새 카테고리 이름 (예: 믿음)"
          className="w-44"
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
      <Button type="submit" variant="outline" disabled={pending || !name.trim()}>
        <Plus className="size-4" />
        카테고리
      </Button>
    </form>
  );
}
