import { db } from "@/lib/db";

export async function getGroups() {
  return db.group.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getMembersWithGroups() {
  return db.member.findMany({
    where: { isActive: true },
    include: { group: true },
    orderBy: [{ group: { sortOrder: "asc" } }, { name: "asc" }],
  });
}
