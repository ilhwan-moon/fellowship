import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { GroupQuickAdd } from "./group-quick-add";
import { GroupCard } from "./group-card";

export default async function GroupsPage() {
  const groups = await db.group.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { members: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">그룹 {groups.length}개</p>
        <GroupQuickAdd />
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            아직 그룹이 없습니다. 위에서 첫 그룹을 만들어보세요.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} memberCount={g._count.members} />
          ))}
        </div>
      )}
    </div>
  );
}
