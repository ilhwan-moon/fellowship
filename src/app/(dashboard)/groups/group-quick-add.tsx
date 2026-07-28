"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createGroup } from "../members/actions";

export function GroupQuickAdd() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createGroup(name);
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
          placeholder="새 그룹 이름 (예: 대학부)"
          className="w-48"
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
      <Button type="submit" disabled={pending || !name.trim()}>
        <Plus className="size-4" />
        그룹 추가
      </Button>
    </form>
  );
}
