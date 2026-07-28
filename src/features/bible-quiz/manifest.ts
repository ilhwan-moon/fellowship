import { BookOpenCheck } from "lucide-react";
import type { FeatureManifest } from "@/features/types";

const manifest: FeatureManifest = {
  slug: "bible-quiz",
  title: "성경퀴즈",
  description: "문제 은행에서 세트를 골라 개인전 또는 팀전으로 퀴즈를 진행합니다.",
  icon: BookOpenCheck,
  category: "게임",
  accent: "from-orange-400 to-pink-500",
  minRole: "LEADER",
  usesMembers: true,
  hasPresentMode: true,
  isComingSoon: true,
};

export default manifest;
