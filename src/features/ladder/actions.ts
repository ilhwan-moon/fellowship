"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { LadderResultEntry } from "@/features/ladder/types";

export async function saveLadderRun(input: { title?: string; result: LadderResultEntry[] }) {
  const run = await db.activityRun.create({
    data: {
      featureSlug: "ladder",
      title: input.title || null,
      status: "DONE",
      endedAt: new Date(),
      config: { participantCount: input.result.length },
      result: { entries: input.result },
      participants: {
        create: input.result.map((r) => ({
          memberId: r.memberId ?? undefined,
          guestName: r.memberId ? undefined : r.name,
          orderNo: r.orderNo,
          resultLabel: `${r.orderNo}번`,
        })),
      },
    },
  });

  revalidatePath("/history");
  revalidatePath("/");

  return { ok: true as const, runId: run.id };
}
