"use client";

import { useMemo, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { parseVerseMarkdown } from "@/features/bible-quiz/lib/verse-parse";
import { bulkImportVerses } from "./actions";

export function BulkImportDialog() {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const parsed = useMemo(() => (raw.trim() ? parseVerseMarkdown(raw) : []), [raw]);
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of parsed) map.set(v.category, (map.get(v.category) ?? 0) + 1);
    return Array.from(map.entries());
  }, [parsed]);

  function reset() {
    setRaw("");
    setResult(null);
    setError(null);
  }

  function handleImport() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await bulkImportVerses(parsed);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(`${res.created}개 추가, ${res.skipped}개 건너뜀 (이미 있는 구절)`);
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
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        마크다운 일괄 가져오기
      </Button>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>구절 일괄 가져오기</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <code>## 카테고리 (N)</code> / <code>### 참조</code> / <code>**참조** 본문</code>{" "}
            형식의 마크다운을 붙여넣으세요. 이미 등록된 (카테고리, 참조) 조합은 건너뜁니다.
          </p>
          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={"## 영생 (2)\n\n### 요한복음 3:16\n\n**요한복음 3:16** 하나님이 세상을...\n"}
            rows={10}
            className="font-mono text-xs"
          />

          {parsed.length > 0 && (
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium">
                미리보기: 카테고리 {byCategory.length}개, 구절 {parsed.length}개
              </p>
              <ul className="mt-1 space-y-0.5 text-muted-foreground">
                {byCategory.map(([name, count]) => (
                  <li key={name}>
                    {name} — {count}개
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {result && <p className="text-sm text-emerald-600">{result}</p>}

          <DialogFooter>
            <Button type="button" onClick={handleImport} disabled={pending || parsed.length === 0}>
              {pending ? "가져오는 중..." : `가져오기 (${parsed.length}개)`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
