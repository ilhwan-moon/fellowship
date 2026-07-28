import ladder from "@/features/ladder/manifest";
import bibleQuiz from "@/features/bible-quiz/manifest";
import type { FeatureManifest } from "@/features/types";

export const FEATURES: FeatureManifest[] = [ladder, bibleQuiz];

export function featureBySlug(slug: string): FeatureManifest | undefined {
  return FEATURES.find((f) => f.slug === slug);
}
