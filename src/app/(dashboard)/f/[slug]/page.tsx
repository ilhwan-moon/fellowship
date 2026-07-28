import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { featureBySlug } from "@/features/registry";

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const feature = featureBySlug(slug);

  if (!feature) notFound();

  return (
    <Card>
      <CardContent className="py-12 text-center text-sm text-muted-foreground">
        {feature.title} 실행 화면은 다음 단계에서 구현됩니다.
      </CardContent>
    </Card>
  );
}
