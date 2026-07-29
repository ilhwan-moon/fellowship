import { BookOpenCheck } from "lucide-react";
import type { FeatureManifest } from "@/features/types";

const manifest: FeatureManifest = {
  slug: "bible-quiz",
  title: "성경퀴즈",
  description: "카테고리와 문제 수를 골라 성경 구절 단어 배열 퀴즈를 진행합니다.",
  icon: BookOpenCheck,
  category: "게임",
  accent: "from-orange-400 to-pink-500",
  minRole: "LEADER",
  usesMembers: false,
  hasPresentMode: true,
};

export default manifest;
