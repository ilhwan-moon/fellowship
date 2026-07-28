const AVATAR_GRADIENTS = [
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-pink-500",
  "from-fuchsia-400 to-purple-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-500",
  "from-rose-400 to-red-500",
  "from-lime-400 to-emerald-500",
];

/** 이름 문자열을 해시해 항상 같은 그라디언트를 반환한다 (아바타 폴백용). */
export function gradientForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export function initialsForName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 1);
}
