"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MemberAvatar } from "@/components/domain/member-avatar";
import { MemberEditDialog, type EditableMember } from "./member-edit-dialog";

const GENDER_LABEL = { BROTHER: "형제", SISTER: "자매" } as const;

export function MemberCard({
  member,
  groups,
}: {
  member: EditableMember;
  groups: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") setOpen(true);
        }}
        className="group cursor-pointer transition-shadow hover:shadow-md hover:ring-foreground/20"
      >
        <CardContent className="flex items-center gap-3">
          <MemberAvatar name={member.name} photoUrl={member.photoUrl} className="size-11" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{member.name}</p>
            {member.gender && (
              <p className="text-xs text-muted-foreground">{GENDER_LABEL[member.gender]}</p>
            )}
          </div>
          <Pencil className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </CardContent>
      </Card>
      <MemberEditDialog member={member} groups={groups} open={open} onOpenChange={setOpen} />
    </>
  );
}
