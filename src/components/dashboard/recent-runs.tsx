import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { featureBySlug } from "@/features/registry";

export type RecentRun = {
  id: string;
  featureSlug: string;
  title: string;
  when: string;
  status: "READY" | "RUNNING" | "DONE";
};

const STATUS_LABEL: Record<RecentRun["status"], string> = {
  READY: "대기",
  RUNNING: "진행 중",
  DONE: "완료",
};

export function RecentRuns({ runs }: { runs: RecentRun[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 진행 이력</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {runs.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            아직 진행한 기능이 없습니다.
          </p>
        ) : (
          <ul className="divide-y">
            {runs.map((run) => {
              const feature = featureBySlug(run.featureSlug);
              return (
                <li
                  key={run.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{run.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {feature?.title ?? run.featureSlug} · {run.when}
                    </p>
                  </div>
                  <Badge
                    variant={run.status === "DONE" ? "secondary" : "default"}
                    className="shrink-0"
                  >
                    {STATUS_LABEL[run.status]}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
