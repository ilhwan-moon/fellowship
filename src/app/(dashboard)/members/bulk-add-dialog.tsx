"use client";

import { useId, useState, useTransition } from "react";
import { FileSpreadsheet, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { NO_GENDER_VALUE, type GenderValue } from "./member-form-fields";
import { parseBulkText, normalizeGenderText } from "./bulk-parse";
import { createMembersBulk } from "./actions";

type Row = { id: string; name: string; gender: GenderValue; groupText: string };

let rowCounter = 0;
function emptyRow(): Row {
  rowCounter += 1;
  return { id: `row-${rowCounter}`, name: "", gender: NO_GENDER_VALUE, groupText: "" };
}

export function BulkAddDialog({ groups }: { groups: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"paste" | "review">("paste");
  const [rawText, setRawText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const groupListId = useId();

  function reset() {
    setPhase("paste");
    setRawText("");
    setRows([]);
    setError(null);
    setResultMessage(null);
  }

  function toReview() {
    const parsed = parseBulkText(rawText);
    const nextRows: Row[] =
      parsed.length > 0
        ? parsed.map((p) => ({
            id: emptyRow().id,
            name: p.name,
            gender: normalizeGenderText(p.genderText) ?? NO_GENDER_VALUE,
            groupText: p.groupText,
          }))
        : [emptyRow(), emptyRow(), emptyRow()];
    setRows(nextRows);
    setPhase("review");
  }

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function handleSubmit() {
    setError(null);
    const valid = rows.filter((r) => r.name.trim());
    if (valid.length === 0) {
      setError("이름이 입력된 행이 없습니다.");
      return;
    }

    startTransition(async () => {
      const result = await createMembersBulk(
        valid.map((r) => ({
          name: r.name.trim(),
          gender: r.gender === NO_GENDER_VALUE ? null : r.gender,
          groupName: r.groupText.trim() || null,
        })),
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setResultMessage(`${result.created}명 등록되었습니다.`);
      setRows([]);
      setRawText("");
      setTimeout(() => {
        setOpen(false);
        reset();
      }, 1200);
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
        <FileSpreadsheet className="size-4" />
        일괄 등록
      </Button>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>성도 일괄 등록</DialogTitle>
        </DialogHeader>

        {phase === "paste" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              엑셀에서 <b>이름 · 성별 · 그룹</b> 순서로 범위를 선택해 복사한 뒤 아래에 붙여넣으세요.
              성별·그룹은 비워도 됩니다. 그룹은 없는 이름이면 새로 만들어집니다.
            </p>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={"김요한\t형제\t청년부\n이은혜\t자매\t청년부\n박다윗"}
              rows={8}
              className="font-mono text-xs"
            />
            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="ghost" onClick={toReview}>
                붙여넣기 없이 직접 입력하기
              </Button>
              <Button type="button" onClick={toReview}>
                표로 변환하기
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <datalist id={groupListId}>
              {groups.map((g) => (
                <option key={g.id} value={g.name} />
              ))}
            </datalist>

            <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
              <div className="hidden grid-cols-[1fr_110px_1fr_28px] gap-2 px-1 text-xs text-muted-foreground sm:grid">
                <span>이름</span>
                <span>성별</span>
                <span>그룹</span>
                <span />
              </div>
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 gap-2 rounded-lg border p-2 sm:grid-cols-[1fr_110px_1fr_28px] sm:items-center sm:rounded-none sm:border-0 sm:border-b sm:p-0 sm:pb-2"
                >
                  <Input
                    value={row.name}
                    onChange={(e) => updateRow(row.id, { name: e.target.value })}
                    placeholder="이름"
                  />
                  <Select
                    value={row.gender}
                    onValueChange={(v) => updateRow(row.id, { gender: v as GenderValue })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_GENDER_VALUE}>선택 안 함</SelectItem>
                      <SelectItem value="BROTHER">형제</SelectItem>
                      <SelectItem value="SISTER">자매</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={row.groupText}
                    onChange={(e) => updateRow(row.id, { groupText: e.target.value })}
                    placeholder="그룹 (선택)"
                    list={groupListId}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeRow(row.id)}
                    className="justify-self-end text-muted-foreground sm:justify-self-center"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="size-4" />행 추가
            </Button>

            <p className="text-xs text-muted-foreground">
              이름이 입력된 행 {rows.filter((r) => r.name.trim()).length}개가 등록됩니다.
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {resultMessage && <p className="text-sm text-emerald-600">{resultMessage}</p>}

            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => setPhase("paste")}>
                뒤로
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={pending}>
                {pending ? "등록 중..." : "일괄 등록"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
