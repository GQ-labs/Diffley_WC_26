import { describe, expect, it } from 'vitest';
import { applyMatchOverrides, countAppliedOverrides } from './overrides';
import type { NormalizedMatch } from './types/match';

const baseMatch: NormalizedMatch = {
  id: 'm73',
  team1: 'Mexico',
  team2: 'USA',
  homeScore: null,
  awayScore: null,
  roundLabel: 'Round of 32',
  stage: 'knockout',
  knockoutRound: 'roundOf32',
  date: '2026-06-28',
  decidedByPenalties: false,
};

describe('match overrides', () => {
  it('applies override by match id', () => {
    const result = applyMatchOverrides(
      [baseMatch],
      [{ id: 'm73', homeScore: 2, awayScore: 1 }],
    );
    expect(result[0]?.homeScore).toBe(2);
    expect(result[0]?.awayScore).toBe(1);
  });

  it('applies override by team names', () => {
    const result = applyMatchOverrides(
      [baseMatch],
      [{ team1: 'Mexico', team2: 'USA', homeScore: 3, awayScore: 2 }],
    );
    expect(result[0]?.homeScore).toBe(3);
  });

  it('counts applied overrides', () => {
    const matches = applyMatchOverrides(
      [baseMatch],
      [{ id: 'm73', homeScore: 1, awayScore: 0 }],
    );
    expect(countAppliedOverrides(matches, [{ id: 'm73', homeScore: 1, awayScore: 0 }])).toBe(1);
  });

  it('leaves matches unchanged when no override matches', () => {
    const result = applyMatchOverrides(
      [baseMatch],
      [{ id: 'm99', homeScore: 5, awayScore: 0 }],
    );
    expect(result[0]?.homeScore).toBeNull();
  });
});
