"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const createMemberSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해주세요.").max(50),
  gender: z.enum(["BROTHER", "SISTER"]).optional(),
  groupId: z.string().optional(),
  photoUrl: z.string().nullable().optional(),
});

export async function createMember(input: {
  name: string;
  gender?: "BROTHER" | "SISTER";
  groupId?: string;
  photoUrl?: string | null;
}) {
  const parsed = createMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { name, gender, groupId, photoUrl } = parsed.data;

  const member = await db.member.create({
    data: {
      name,
      gender,
      groupId: groupId || undefined,
      photoUrl: photoUrl || undefined,
    },
  });

  revalidatePath("/members");
  revalidatePath("/groups");
  revalidatePath("/");
  return { ok: true as const, member };
}

const updateMemberSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해주세요.").max(50),
  gender: z.enum(["BROTHER", "SISTER"]).nullable().optional(),
  groupId: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
});

export async function updateMember(
  id: string,
  input: {
    name: string;
    gender?: "BROTHER" | "SISTER" | null;
    groupId?: string | null;
    photoUrl?: string | null;
  },
) {
  const parsed = updateMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { name, gender, groupId, photoUrl } = parsed.data;

  const member = await db.member.update({
    where: { id },
    data: {
      name,
      gender: gender ?? null,
      groupId: groupId ?? null,
      photoUrl: photoUrl ?? null,
    },
  });

  revalidatePath("/members");
  revalidatePath("/groups");
  revalidatePath("/");
  return { ok: true as const, member };
}

export async function deactivateMember(id: string) {
  await db.member.update({ where: { id }, data: { isActive: false } });

  revalidatePath("/members");
  revalidatePath("/groups");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateGroupName(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false as const, error: "그룹 이름을 입력해주세요." };

  const existing = await db.group.findUnique({ where: { name: trimmed } });
  if (existing && existing.id !== id) {
    return { ok: false as const, error: "이미 같은 이름의 그룹이 있습니다." };
  }

  const group = await db.group.update({ where: { id }, data: { name: trimmed } });

  revalidatePath("/members");
  revalidatePath("/groups");
  return { ok: true as const, group };
}

const bulkRowSchema = z.object({
  name: z.string().trim().min(1).max(50),
  gender: z.enum(["BROTHER", "SISTER"]).nullable().optional(),
  groupName: z.string().trim().nullable().optional(),
});

export async function createMembersBulk(
  rows: { name: string; gender?: "BROTHER" | "SISTER" | null; groupName?: string | null }[],
) {
  const parsedRows = rows
    .map((r) => bulkRowSchema.safeParse(r))
    .filter((r) => r.success)
    .map((r) => r.data);

  if (parsedRows.length === 0) {
    return { ok: false as const, error: "등록할 성도가 없습니다. 이름을 확인해주세요." };
  }

  const groupNameToId = new Map<string, string>();
  let created = 0;

  for (const row of parsedRows) {
    let groupId: string | undefined;
    const groupName = row.groupName?.trim();

    if (groupName) {
      if (!groupNameToId.has(groupName)) {
        const existing = await db.group.findUnique({ where: { name: groupName } });
        if (existing) {
          groupNameToId.set(groupName, existing.id);
        } else {
          const count = await db.group.count();
          const newGroup = await db.group.create({
            data: { name: groupName, sortOrder: count },
          });
          groupNameToId.set(groupName, newGroup.id);
        }
      }
      groupId = groupNameToId.get(groupName);
    }

    await db.member.create({
      data: { name: row.name, gender: row.gender ?? undefined, groupId },
    });
    created++;
  }

  revalidatePath("/members");
  revalidatePath("/groups");
  revalidatePath("/");
  return { ok: true as const, created };
}

export async function createGroup(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false as const, error: "그룹 이름을 입력해주세요." };

  const existing = await db.group.findUnique({ where: { name: trimmed } });
  if (existing) return { ok: true as const, group: existing };

  const count = await db.group.count();
  const group = await db.group.create({
    data: { name: trimmed, sortOrder: count },
  });

  revalidatePath("/members");
  revalidatePath("/groups");
  return { ok: true as const, group };
}
