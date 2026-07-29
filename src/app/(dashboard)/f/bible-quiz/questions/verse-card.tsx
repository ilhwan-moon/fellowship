"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { VerseEditDialog, type EditableVerse } from "./verse-edit-dialog";

export function VerseCard({
  verse,
  categories,
}: {
  verse: EditableVerse;
  categories: { id: string; name: string }[];
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
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">{verse.reference}</p>
            <Pencil className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{verse.text}</p>
        </CardContent>
      </Card>
      <VerseEditDialog verse={verse} categories={categories} open={open} onOpenChange={setOpen} />
    </>
  );
}
