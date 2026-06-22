import { describe, expect, it } from 'vitest';
import { buildBracketTree, r32DataAvailableFromServer } from './bracket';
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

function koMatch(
  num: number,
  team1: string,
  team2: string,
  round: NormalizedMatch['knockoutRound'],
  homeScore: number | null = null,
  awayScore: number | null = null,
): NormalizedMatch {
  return {
    id: `m${num}`,
    team1,
    team2,
    homeScore,
    awayScore,
    roundLabel:
      round === 'roundOf32'
        ? 'Round of 32'
        : round === 'roundOf16'
          ? 'Round of 16'
          : 'Knockout',
    stage: 'knockout',
    knockoutRound: round,
    date: '2026-06-28',
    decidedByPenalties: false,
  };
}

describe('bracket', () => {
  it('projects third-place assignments in match-number order', () => {
    const matches = [
      groupMatch('Group A', 'Mexico', 'South Africa', 2, 0, 'a1'),
      groupMatch('Group A', 'Korea', 'Czechia', 2, 1, 'a2'),
      groupMatch('Group A', 'Czechia', 'South Africa', 0, 1, 'a3'),
      groupMatch('Group A', 'Mexico', 'Korea', 1, 1, 'a4'),
      groupMatch('Group A', 'Czechia', 'Mexico', 0, 2, 'a5'),
      groupMatch('Group A', 'South Africa', 'Korea', 0, 2, 'a6'),
      groupMatch('Group E', 'Germany', 'Ecuador', 2, 0, 'e1'),
      groupMatch('Group E', 'Ivory Coast', 'Curacao', 2, 0, 'e2'),
      groupMatch('Group E', 'Curacao', 'Ecuador', 0, 1, 'e3'),
      groupMatch('Group E', 'Germany', 'Ivory Coast', 1, 1, 'e4'),
      groupMatch('Group E', 'Curacao', 'Germany', 0, 2, 'e5'),
      groupMatch('Group E', 'Ecuador', 'Ivory Coast', 0, 1, 'e6'),
    ];

    const tree = buildBracketTree(matches);
    const match74 = tree.roundOf32.find((match) => match.num === 74);
    expect(match74?.team1).toBe('Germany');
    expect(match74?.team2).toBe('South Africa');
    expect(tree.projected).toBe(true);
  });

  it('requires all group matches before R32 data is considered available', () => {
    const matches = [koMatch(73, 'Mexico', 'USA', 'roundOf32')];
    expect(r32DataAvailableFromServer(matches)).toBe(false);
  });
});
