import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FeatureManifest } from "@/features/types";

export function FeatureCard({ feature }: { feature: FeatureManifest }) {
  const Icon = feature.icon;
  const body = (
    <Card
      className={cn(
        "h-full transition-shadow",
        feature.isComingSoon
          ? "opacity-70"
          : "hover:shadow-md hover:ring-foreground/20",
      )}
    >
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white",
              feature.accent,
            )}
          >
            <Icon className="size-5" />
          </div>
          {feature.isComingSoon ? (
            <Badge variant="secondary">준비 중</Badge>
          ) : (
            <Badge variant="secondary">{feature.category}</Badge>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-medium">{feature.title}</h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
        {!feature.isComingSoon && (
          <div className="flex items-center gap-1 text-sm font-medium text-foreground">
            실행하기
            <ArrowRight className="size-4" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (feature.isComingSoon) {
    return <div className="cursor-not-allowed">{body}</div>;
  }

  return (
    <Link href={`/f/${feature.slug}`} className="block h-full">
      {body}
    </Link>
  );
}
