"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhotoInput } from "@/components/domain/photo-input";
import type { Participant } from "@/features/ladder/types";

let guestCounter = 0;

export function GuestAdder({ onAdd }: { onAdd: (guest: Participant) => void }) {
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    guestCounter += 1;
    onAdd({
      key: `guest-${Date.now()}-${guestCounter}`,
      name: trimmed,
      photoUrl,
      memberId: null,
      groupName: null,
    });
    setName("");
    setPhotoUrl(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-3">
      <PhotoInput value={photoUrl} onChange={setPhotoUrl} name={name} />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        }}
        placeholder="명단에 없는 참가자 이름"
        className="max-w-48"
      />
      <Button type="button" variant="outline" onClick={handleAdd} disabled={!name.trim()}>
        <UserPlus className="size-4" />
        추가
      </Button>
    </div>
  );
}
