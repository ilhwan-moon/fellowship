const BROTHER_TEXTS = ["형제", "남", "남자", "M", "MALE", "BROTHER"];
const SISTER_TEXTS = ["자매", "여", "여자", "F", "FEMALE", "SISTER"];

export type ParsedBulkRow = { name: string; genderText: string; groupText: string };

/** 엑셀에서 복사한 탭 구분 텍스트(또는 쉼표 구분)를 이름/성별/그룹 행으로 분리한다. */
export function parseBulkText(text: string): ParsedBulkRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cols = line.includes("\t") ? line.split("\t") : line.split(",");
      return {
        name: (cols[0] ?? "").trim(),
        genderText: (cols[1] ?? "").trim(),
        groupText: (cols[2] ?? "").trim(),
      };
    })
    .filter((row) => row.name);
}

export function normalizeGenderText(text: string): "BROTHER" | "SISTER" | null {
  const t = text.trim().toUpperCase();
  if (!t) return null;
  if (BROTHER_TEXTS.includes(t)) return "BROTHER";
  if (SISTER_TEXTS.includes(t)) return "SISTER";
  return null;
}
