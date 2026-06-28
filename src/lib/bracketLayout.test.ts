import { describe, expect, it } from 'vitest';
import {
  BRACKET_FEEDER_FORKS,
  BRACKET_TREE_ROWS,
  getBracketSlot,
  LEFT_R32_ORDER,
  LIST_R32_ORDER,
} from './bracketLayout';

describe('bracketLayout', () => {
  it('orders left R32 in feeder pairs', () => {
    expect(LEFT_R32_ORDER.slice(0, 2)).toEqual([74, 77]);
    expect(LEFT_R32_ORDER.slice(2, 4)).toEqual([73, 75]);
  });

  it('centres R16 matches between feeder R32 rows', () => {
    expect(getBracketSlot(89)).toEqual({ num: 89, column: 'r16-left', row: 2 });
    expect(getBracketSlot(74)?.row).toBe(1);
    expect(getBracketSlot(77)?.row).toBe(3);
  });

  it('lists every knockout fork', () => {
    expect(BRACKET_FEEDER_FORKS).toHaveLength(14);
  });

  it('uses sixteen tree rows', () => {
    expect(BRACKET_TREE_ROWS).toBe(16);
    expect(LIST_R32_ORDER).toHaveLength(16);
  });
});
