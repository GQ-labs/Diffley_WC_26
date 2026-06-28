/** Desktop bracket tree layout (16-row grid, feeder-pair order). */

export const BRACKET_TREE_ROWS = 16;

/** R32 match numbers in feeder-pair order (top to bottom). */
export const LEFT_R32_ORDER = [74, 77, 73, 75, 76, 78, 79, 80] as const;
export const RIGHT_R32_ORDER = [83, 84, 81, 82, 86, 88, 85, 87] as const;

export const LEFT_R16_ORDER = [89, 90, 91, 92] as const;
export const RIGHT_R16_ORDER = [93, 94, 95, 96] as const;

export const LEFT_QF_ORDER = [97, 99] as const;
export const RIGHT_QF_ORDER = [98, 100] as const;

export const CENTER_ORDER = [101, 104, 103, 102] as const;

export type BracketColumnId =
  | 'r32-left'
  | 'r16-left'
  | 'qf-left'
  | 'center'
  | 'qf-right'
  | 'r16-right'
  | 'r32-right';

export const BRACKET_COLUMN_INDEX: Record<BracketColumnId, number> = {
  'r32-left': 1,
  'r16-left': 2,
  'qf-left': 3,
  center: 4,
  'qf-right': 5,
  'r16-right': 6,
  'r32-right': 7,
};

export interface BracketSlot {
  num: number;
  column: BracketColumnId;
  row: number;
}

const MATCH_SLOT: Record<number, Omit<BracketSlot, 'num'>> = {};

function register(matches: readonly number[], column: BracketColumnId, rowFn: (i: number) => number) {
  matches.forEach((num, index) => {
    MATCH_SLOT[num] = { column, row: rowFn(index) };
  });
}

register(LEFT_R32_ORDER, 'r32-left', (i) => i * 2 + 1);
register(RIGHT_R32_ORDER, 'r32-right', (i) => i * 2 + 1);
register(LEFT_R16_ORDER, 'r16-left', (i) => i * 4 + 2);
register(RIGHT_R16_ORDER, 'r16-right', (i) => i * 4 + 2);
register(LEFT_QF_ORDER, 'qf-left', (i) => i * 8 + 4);
register(RIGHT_QF_ORDER, 'qf-right', (i) => i * 8 + 4);

MATCH_SLOT[101] = { column: 'center', row: 4 };
MATCH_SLOT[104] = { column: 'center', row: 8 };
MATCH_SLOT[103] = { column: 'center', row: 10 };
MATCH_SLOT[102] = { column: 'center', row: 12 };

/** Parent pair -> child match for connector lines. */
export const BRACKET_FEEDER_FORKS: Array<{ child: number; parents: [number, number] }> = [
  { child: 89, parents: [74, 77] },
  { child: 90, parents: [73, 75] },
  { child: 91, parents: [76, 78] },
  { child: 92, parents: [79, 80] },
  { child: 93, parents: [83, 84] },
  { child: 94, parents: [81, 82] },
  { child: 95, parents: [86, 88] },
  { child: 96, parents: [85, 87] },
  { child: 97, parents: [89, 90] },
  { child: 98, parents: [93, 94] },
  { child: 99, parents: [91, 92] },
  { child: 100, parents: [95, 96] },
  { child: 101, parents: [97, 98] },
  { child: 102, parents: [99, 100] },
];

/** Single-feeder links into the final. */
export const BRACKET_FEEDER_LINES: Array<{ child: number; parent: number }> = [
  { child: 104, parent: 101 },
  { child: 104, parent: 102 },
];

export function getBracketSlot(num: number): BracketSlot | null {
  const slot = MATCH_SLOT[num];
  if (!slot) return null;
  return { num, ...slot };
}

export function getBracketColumnIndex(num: number): number {
  const slot = MATCH_SLOT[num];
  return slot ? BRACKET_COLUMN_INDEX[slot.column] : 0;
}

/** True when connectors should run from the right edge of the parent (left half). */
export function bracketLineExitsRight(num: number): boolean {
  const col = getBracketColumnIndex(num);
  return col > 0 && col <= 3;
}

/** Mobile list: R32 in feeder-pair order, other rounds unchanged. */
export const LIST_R32_ORDER = [...LEFT_R32_ORDER, ...RIGHT_R32_ORDER] as const;

export const DESKTOP_COLUMN_LABELS: Array<{ id: BracketColumnId; label: string }> = [
  { id: 'r32-left', label: 'Round of 32' },
  { id: 'r16-left', label: 'Round of 16' },
  { id: 'qf-left', label: 'Quarter-final' },
  { id: 'center', label: 'Semi-final' },
  { id: 'qf-right', label: 'Quarter-final' },
  { id: 'r16-right', label: 'Round of 16' },
  { id: 'r32-right', label: 'Round of 32' },
];
