import { describe, expect, it } from 'vitest';
import { buildAllGroupTables, rankThirdPlaceTeams } from './groups';
import type { NormalizedMatch } from './types/match';

function groupMatch(
  group: string,
  team1: string,
  team2: string,
  homeScore: number,
  awayScore: number,
  id: string,
): NormalizedMatch {
  return {
    id,
    team1,
    team2,
    homeScore,
    awayScore,
    roundLabel: 'Matchday 1',
    stage: 'group',
    knockoutRound: null,
    date: '2026-06-11',
    decidedByPenalties: false,
    group,
  };
}

describe('groups', () => {
  it('ranks Group A from completed matches', () => {
    const matches = [
      groupMatch('Group A', 'Mexico', 'South Africa', 2, 0, 'g1'),
      groupMatch('Group A', 'Korea', 'Czechia', 2, 1, 'g2'),
      groupMatch('Group A', 'Czechia', 'South Africa', 0, 1, 'g3'),
      groupMatch('Group A', 'Mexico', 'Korea', 1, 1, 'g4'),
      groupMatch('Group A', 'Czechia', 'Mexico', 0, 2, 'g5'),
      groupMatch('Group A', 'South Africa', 'Korea', 0, 2, 'g6'),
    ];

    const table = buildAllGroupTables(matches).find((entry) => entry.letter === 'A');
    expect(table?.rows.map((row) => row.team)).toEqual([
      'Mexico',
      'Korea',
      'South Africa',
      'Czechia',
    ]);
    expect(table?.rows[0]?.qualification).toBe('qualified');
    expect(table?.rows[2]?.qualification).toBe('third-live');
  });

  it('ranks the eight best third-placed teams', () => {
    const tables = buildAllGroupTables([
      groupMatch('Group A', 'Mexico', 'South Africa', 1, 0, 'a1'),
      groupMatch('Group A', 'Korea', 'Czechia', 1, 0, 'a2'),
      groupMatch('Group A', 'Czechia', 'South Africa', 1, 0, 'a3'),
      groupMatch('Group A', 'Mexico', 'Korea', 1, 0, 'a4'),
      groupMatch('Group A', 'Czechia', 'Mexico', 0, 1, 'a5'),
      groupMatch('Group A', 'South Africa', 'Korea', 0, 1, 'a6'),
      groupMatch('Group B', 'Canada', 'Qatar', 2, 0, 'b1'),
      groupMatch('Group B', 'Switzerland', 'Bosnia', 2, 0, 'b2'),
      groupMatch('Group B', 'Bosnia', 'Qatar', 2, 0, 'b3'),
      groupMatch('Group B', 'Canada', 'Switzerland', 2, 0, 'b4'),
      groupMatch('Group B', 'Bosnia', 'Canada', 0, 1, 'b5'),
      groupMatch('Group B', 'Qatar', 'Switzerland', 0, 1, 'b6'),
    ]);

    const thirds = rankThirdPlaceTeams(tables);
    expect(thirds[0]?.advances).toBe(true);
    expect(thirds.filter((entry) => entry.advances)).toHaveLength(2);
  });
});
