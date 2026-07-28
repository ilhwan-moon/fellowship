import type { LucideIcon } from "lucide-react";

export type FeatureCategory = "게임" | "진행" | "관리" | "기타";

export type FeatureRole = "ADMIN" | "LEADER" | "MEMBER";

export type FeatureManifest = {
  /** URL 및 DB 키로 사용되는 고유 식별자 */
  slug: string;
  title: string;
  /** 대시보드 카드에 표시되는 한 줄 설명 */
  description: string;
  icon: LucideIcon;
  category: FeatureCategory;
  /** 카드 배경 그라디언트 (Tailwind from-*/to-* 클래스) */
  accent: string;
  minRole: FeatureRole;
  /** 참가자 명단 선택 UI가 필요한 기능인지 */
  usesMembers: boolean;
  /** 빔프로젝터 등 큰 화면용 표출 모드 제공 여부 */
  hasPresentMode: boolean;
  /** 아직 실행 화면이 없는 준비 중 기능 */
  isComingSoon?: boolean;
};
