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
  MemberFormFields,
  NEW_GROUP_VALUE,
  NO_GENDER_VALUE,
  NO_GROUP_VALUE,
  type GenderValue,
} from "./member-form-fields";
import { createGroup, deactivateMember, updateMember } from "./actions";

export type EditableMember = {
  id: string;
  name: string;
  gender: "BROTHER" | "SISTER" | null;
  groupId: string | null;
  photoUrl: string | null;
};

export function MemberEditDialog({
  member,
  groups,
  open,
  onOpenChange,
}: {
  member: EditableMember;
  groups: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(member.name);
  const [gender, setGender] = useState<GenderValue>(member.gender ?? NO_GENDER_VALUE);
  const [groupId, setGroupId] = useState<string>(member.groupId ?? NO_GROUP_VALUE);
  const [newGroupName, setNewGroupName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(member.photoUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function syncFromMember() {
    setName(member.name);
    setGender(member.gender ?? NO_GENDER_VALUE);
    setGroupId(member.groupId ?? NO_GROUP_VALUE);
    setNewGroupName("");
    setPhotoUrl(member.photoUrl);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      let finalGroupId: string | null = null;

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

      const result = await updateMember(member.id, {
        name,
        gender: gender === NO_GENDER_VALUE ? null : gender,
        groupId: finalGroupId,
        photoUrl,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
    });
  }

  function handleDeactivate() {
    if (!confirm(`${member.name} 님을 명단에서 비활성화할까요? 진행 이력은 그대로 남습니다.`)) return;
    startTransition(async () => {
      await deactivateMember(member.id);
      onOpenChange(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) syncFromMember();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>성도 정보 수정</DialogTitle>
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

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={handleDeactivate}
              disabled={pending}
            >
              성도 비활성화
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {pending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
