export type ParsedVerse = { category: string; reference: string; text: string };

/**
 * "## 카테고리 (N)" / "**참조** 본문" 형식의 마크다운을 절 단위로 파싱한다.
 * (예: data/bible-memory-verses.md) "야고보서 2:9~10"처럼 여러 절이 묶인 항목도
 * 원문에서는 절마다 굵게 표기돼 있으므로, 절 하나하나를 개별 문제로 분리해 반환한다.
 */
export function parseVerseMarkdown(markdown: string): ParsedVerse[] {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const categoryBlocks = normalized.split(/\n(?=## )/).filter((b) => b.trim().startsWith("## "));

  const results: ParsedVerse[] = [];

  for (const block of categoryBlocks) {
    const lines = block.split("\n");
    const headerLine = lines[0].replace(/^##\s*/, "").trim();
    const categoryName = headerLine.replace(/\s*\(\d+\)\s*$/, "").trim();
    const body = lines.slice(1).join("\n");

    for (const m of body.matchAll(/\*\*(.+?)\*\*\s*(.+)/g)) {
      const reference = m[1].trim();
      const text = m[2].trim();
      if (categoryName && reference && text) {
        results.push({ category: categoryName, reference, text });
      }
    }
  }

  return results;
}
