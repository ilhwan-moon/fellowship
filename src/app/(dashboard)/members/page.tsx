import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getGroups, getMembersWithGroups } from "@/lib/members";
import { MemberFormDialog } from "./member-form-dialog";
import { MemberCard } from "./member-card";
import { BulkAddDialog } from "./bulk-add-dialog";

export default async function MembersPage() {
  const [groups, members] = await Promise.all([getGroups(), getMembersWithGroups()]);

  const unassigned = members.filter((m) => !m.groupId);
  const byGroup = groups
    .map((g) => ({ group: g, members: members.filter((m) => m.groupId === g.id) }))
    .filter((entry) => entry.members.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          등록된 성도 {members.length}명 · 그룹 {groups.length}개
        </p>
        <div className="flex gap-2">
          <BulkAddDialog groups={groups} />
          <MemberFormDialog groups={groups} />
        </div>
      </div>

      {members.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            아직 등록된 성도가 없습니다. &ldquo;성도 추가&rdquo;로 첫 성도를 등록해보세요.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {byGroup.map(({ group, members }) => (
            <section key={group.id} className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                {group.name}
                <Badge variant="secondary">{members.length}명</Badge>
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((m) => (
                  <MemberCard key={m.id} member={m} groups={groups} />
                ))}
              </div>
            </section>
          ))}

          {unassigned.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                미배정
                <Badge variant="secondary">{unassigned.length}명</Badge>
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unassigned.map((m) => (
                  <MemberCard key={m.id} member={m} groups={groups} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
