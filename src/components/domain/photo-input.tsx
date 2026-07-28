"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resizeImageToDataUrl } from "@/lib/image";
import { cn } from "@/lib/utils";

export function PhotoInput({
  value,
  onChange,
  name,
  className,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  /** 아바타 폴백에 쓰일 이름 (선택) */
  name?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, { size: 256 });
      onChange(dataUrl);
    } catch {
      // 리사이즈 실패 시 조용히 무시 - 사용자는 다시 시도할 수 있음
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-muted text-muted-foreground transition-colors hover:bg-muted/70"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={name ?? "사진"} className="size-full object-cover" />
        ) : (
          <Camera className="size-5" />
        )}
      </button>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "처리 중..." : value ? "사진 변경" : "사진 선택"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            className="text-muted-foreground"
          >
            <X className="size-3.5" />
            제거
          </Button>
        )}
      </div>
    </div>
  );
}
