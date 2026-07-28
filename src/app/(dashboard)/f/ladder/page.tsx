import { getMembersWithGroups } from "@/lib/members";
import { LadderGame } from "@/features/ladder/components/ladder-game";
import type { Participant } from "@/features/ladder/types";

export default async function LadderPage() {
  const members = await getMembersWithGroups();

  const participants: Participant[] = members.map((m) => ({
    key: m.id,
    name: m.name,
    photoUrl: m.photoUrl,
    memberId: m.id,
    groupName: m.group?.name ?? null,
  }));

  return <LadderGame initialMembers={participants} />;
}
