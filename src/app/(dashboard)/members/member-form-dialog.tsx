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
  MemberFormFields,
  NEW_GROUP_VALUE,
  NO_GENDER_VALUE,
  NO_GROUP_VALUE,
  type GenderValue,
} from "./member-form-fields";
import { createGroup, createMember } from "./actions";

export function MemberFormDialog({
  groups,
}: {
  groups: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<GenderValue>(NO_GENDER_VALUE);
  const [groupId, setGroupId] = useState<string>(NO_GROUP_VALUE);
  const [newGroupName, setNewGroupName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setName("");
    setGender(NO_GENDER_VALUE);
    setGroupId(NO_GROUP_VALUE);
    setNewGroupName("");
    setPhotoUrl(null);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      let finalGroupId: string | undefined;

      if (groupId === NEW_GROUP_VALUE) {
        if (!newGroupName.trim()) {
          setError("새 그룹 이름을 입력해주세요.");
          return;
        }
        const groupResult = await createGroup(newGroupName);
        if (!groupResult.ok) {
          setError(groupResult.error);
          return;
        }
        finalGroupId = groupResult.group.id;
      } else if (groupId !== NO_GROUP_VALUE) {
        finalGroupId = groupId;
      }

      const result = await createMember({
        name,
        gender: gender === NO_GENDER_VALUE ? undefined : gender,
        groupId: finalGroupId,
        photoUrl,
      });

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
          성도 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>성도 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <MemberFormFields
            photoUrl={photoUrl}
            onPhotoChange={setPhotoUrl}
            name={name}
            onNameChange={setName}
            gender={gender}
            onGenderChange={setGender}
            groupId={groupId}
            onGroupIdChange={setGroupId}
            groups={groups}
            newGroupName={newGroupName}
            onNewGroupNameChange={setNewGroupName}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending || !name.trim()}>
              {pending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
