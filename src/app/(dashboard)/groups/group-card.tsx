"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GroupEditDialog } from "./group-edit-dialog";

export function GroupCard({
  group,
  memberCount,
}: {
  group: { id: string; name: string };
  memberCount: number;
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
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-medium">{group.name}</p>
            <Pencil className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <Badge variant="secondary">{memberCount}명</Badge>
        </CardContent>
      </Card>
      <GroupEditDialog group={group} open={open} onOpenChange={setOpen} />
    </>
  );
}
