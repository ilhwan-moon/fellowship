import { Users, PlayCircle, CalendarDays } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { FeatureCard } from "@/components/dashboard/feature-card";
import { RecentRuns, type RecentRun } from "@/components/dashboard/recent-runs";
import { FEATURES } from "@/features/registry";
import { db } from "@/lib/db";
import { featureBySlug } from "@/features/registry";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" });

export default async function DashboardPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [memberCount, runsThisMonth, recentRuns] = await Promise.all([
    db.member.count({ where: { isActive: true } }),
    db.activityRun.count({ where: { startedAt: { gte: startOfMonth } } }),
    db.activityRun.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
  ]);

  const runs: RecentRun[] = recentRuns.map((r) => ({
    id: r.id,
    featureSlug: r.featureSlug,
    title: r.title ?? featureBySlug(r.featureSlug)?.title ?? r.featureSlug,
    when: dateFormatter.format(r.startedAt),
    status: r.status as RecentRun["status"],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="등록된 성도"
          value={`${memberCount}명`}
          icon={Users}
          accent="from-sky-400 to-blue-500"
        />
        <StatCard
          label="이번 달 진행 횟수"
          value={`${runsThisMonth}회`}
          icon={PlayCircle}
          accent="from-emerald-400 to-teal-500"
        />
        <StatCard
          label="최근 진행 기능"
          value={runs[0] ? (featureBySlug(runs[0].featureSlug)?.title ?? runs[0].featureSlug) : "-"}
          icon={CalendarDays}
          accent="from-orange-400 to-pink-500"
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          기능 선택
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.slug} feature={feature} />
          ))}
        </div>
      </div>

      <RecentRuns runs={runs} />
    </div>
  );
}
