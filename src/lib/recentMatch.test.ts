import { describe, expect, it } from 'vitest';
import { getLatestResult, getLatestResults } from './recentMatch';
import type { NormalizedMatch } from './types/match';

function m(partial: Partial<NormalizedMatch> & Pick<NormalizedMatch, 'team1' | 'team2'>): NormalizedMatch {
  return {
    id: partial.id ?? 'm1',
    homeScore: partial.homeScore ?? null,
    awayScore: partial.awayScore ?? null,
    roundLabel: partial.roundLabel ?? 'Matchday 1',
    stage: partial.stage ?? 'group',
    knockoutRound: partial.knockoutRound ?? null,
    date: partial.date ?? '2026-06-11',
    decidedByPenalties: false,
    ...partial,
  };
}

describe('getLatestResult', () => {
  it('returns the most recent completed matches', () => {
    const results = getLatestResults([
      m({ id: 'a', team1: 'Mexico', team2: 'South Africa', homeScore: 2, awayScore: 0, date: '2026-06-11' }),
      m({ id: 'b', team1: 'USA', team2: 'Paraguay', homeScore: 4, awayScore: 1, date: '2026-06-12' }),
      m({ id: 'c', team1: 'Brazil', team2: 'England', homeScore: 1, awayScore: 1, date: '2026-06-13' }),
    ], 3);
    expect(results.map((r) => r.team1)).toEqual(['Brazil', 'USA', 'Mexico']);
  });

  it('getLatestResult returns only the newest match', () => {
    const result = getLatestResult([
      m({ id: 'a', team1: 'Mexico', team2: 'South Africa', homeScore: 2, awayScore: 0, date: '2026-06-11' }),
      m({ id: 'b', team1: 'USA', team2: 'Paraguay', homeScore: 4, awayScore: 1, date: '2026-06-12' }),
    ]);
    expect(result?.team1).toBe('USA');
    expect(result?.homeScore).toBe(4);
  });

  it('returns null when no matches played', () => {
    expect(getLatestResult([m({ team1: 'A', team2: 'B' })])).toBeNull();
  });
});
