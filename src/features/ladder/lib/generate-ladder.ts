export { shuffled } from "@/lib/shuffle";

export type LadderRung = { row: number; leftIndex: number };

/** 참가자 수에 맞는 사다리 가로줄(행) 개수를 정한다. */
export function rowsForCount(count: number): number {
  return Math.min(28, Math.max(14, count * 4));
}

/** 각 행에서 인접한 두 세로줄을 잇는 가로줄을 무작위로 생성한다. (같은 행에서 세로줄이 겹치지 않게) */
export function generateRungs(count: number, rows: number): LadderRung[] {
  const rungs: LadderRung[] = [];
  for (let row = 0; row < rows; row++) {
    const usedThisRow = new Set<number>();
    for (let col = 0; col < count - 1; col++) {
      if (usedThisRow.has(col - 1)) continue;
      if (Math.random() < 0.45) {
        rungs.push({ row, leftIndex: col });
        usedThisRow.add(col);
      }
    }
  }
  return rungs;
}

/** 각 시작 위치(top rail index)가 가로줄을 타고 내려가 도착하는 위치(bottom rail index)를 계산한다. */
export function computeResultOrder(count: number, rungs: LadderRung[], rows: number): number[] {
  const byRow: Set<number>[] = Array.from({ length: rows }, () => new Set());
  for (const r of rungs) byRow[r.row].add(r.leftIndex);

  const result: number[] = [];
  for (let start = 0; start < count; start++) {
    let pos = start;
    for (let row = 0; row < rows; row++) {
      if (byRow[row].has(pos)) pos += 1;
      else if (byRow[row].has(pos - 1)) pos -= 1;
    }
    result[start] = pos;
  }
  return result;
}
