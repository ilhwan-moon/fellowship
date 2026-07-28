import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const GROUPS = ["청년부", "장년부", "청소년부"];

const MEMBERS: { name: string; group: string; gender: "BROTHER" | "SISTER" }[] = [
  { name: "김요한", group: "청년부", gender: "BROTHER" },
  { name: "이은혜", group: "청년부", gender: "SISTER" },
  { name: "박다윗", group: "청년부", gender: "BROTHER" },
  { name: "최마리아", group: "청년부", gender: "SISTER" },
  { name: "정바울", group: "장년부", gender: "BROTHER" },
  { name: "한소망", group: "장년부", gender: "SISTER" },
  { name: "윤사랑", group: "청소년부", gender: "SISTER" },
  { name: "임믿음", group: "청소년부", gender: "BROTHER" },
];

async function main() {
  const groupByName = new Map<string, string>();

  for (const [i, name] of GROUPS.entries()) {
    const group = await db.group.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: i },
    });
    groupByName.set(name, group.id);
  }

  for (const m of MEMBERS) {
    const existing = await db.member.findFirst({ where: { name: m.name } });
    if (existing) continue;
    await db.member.create({
      data: {
        name: m.name,
        gender: m.gender,
        groupId: groupByName.get(m.group),
      },
    });
  }

  console.log(`시드 완료: 그룹 ${GROUPS.length}개, 성도 ${MEMBERS.length}명`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
