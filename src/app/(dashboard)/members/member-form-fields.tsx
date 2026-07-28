"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoInput } from "@/components/domain/photo-input";

export const NEW_GROUP_VALUE = "__new_group__";
export const NO_GROUP_VALUE = "__no_group__";
export const NO_GENDER_VALUE = "__no_gender__";

export type GenderValue = "BROTHER" | "SISTER" | typeof NO_GENDER_VALUE;

export function MemberFormFields({
  photoUrl,
  onPhotoChange,
  name,
  onNameChange,
  gender,
  onGenderChange,
  groupId,
  onGroupIdChange,
  groups,
  newGroupName,
  onNewGroupNameChange,
}: {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  name: string;
  onNameChange: (name: string) => void;
  gender: GenderValue;
  onGenderChange: (gender: GenderValue) => void;
  groupId: string;
  onGroupIdChange: (groupId: string) => void;
  groups: { id: string; name: string }[];
  newGroupName: string;
  onNewGroupNameChange: (name: string) => void;
}) {
  return (
    <>
      <div className="flex justify-center">
        <PhotoInput value={photoUrl} onChange={onPhotoChange} name={name} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="member-name">이름</Label>
        <Input
          id="member-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="홍길동"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>성별</Label>
        <Select value={gender} onValueChange={(v) => onGenderChange(v as GenderValue)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_GENDER_VALUE}>선택 안 함</SelectItem>
            <SelectItem value="BROTHER">형제</SelectItem>
            <SelectItem value="SISTER">자매</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>그룹</Label>
        <Select value={groupId} onValueChange={onGroupIdChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_GROUP_VALUE}>미배정</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
            <SelectItem value={NEW_GROUP_VALUE}>+ 새 그룹 만들기</SelectItem>
          </SelectContent>
        </Select>
        {groupId === NEW_GROUP_VALUE && (
          <Input
            autoFocus
            value={newGroupName}
            onChange={(e) => onNewGroupNameChange(e.target.value)}
            placeholder="새 그룹 이름 (예: 대학부)"
            className="mt-2"
          />
        )}
      </div>
    </>
  );
}
