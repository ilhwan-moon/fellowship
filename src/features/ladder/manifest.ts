import { Milestone } from "lucide-react";
import type { FeatureManifest } from "@/features/types";

const manifest: FeatureManifest = {
  slug: "ladder",
  title: "사다리타기 · 간증 순서",
  description: "명단을 뽑아 사다리로 순서를 정하고, 큰 화면으로 발표자를 진행합니다.",
  icon: Milestone,
  category: "진행",
  accent: "from-sky-500 to-fuchsia-500",
  minRole: "LEADER",
  usesMembers: true,
  hasPresentMode: true,
};

export default manifest;
