import { describe, expect, it } from 'vitest';
import { completeGroupStageMatches } from './testFixtures';
import { buildBracketTree, formatFeederSlot, getBracketFeederTemplate, bracketMatchShowsFeederPaths, r32DataAvailableFromServer } from './bracket';
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

  it('projects winners through later knockout rounds for display', () => {
    const matches = completeGroupStageMatches();
    const tree = buildBracketTree(matches, { projectFutureRounds: true });
    const match90 = tree.roundOf16.find((match) => match.num === 90);
    expect(match90?.team1).not.toBe('TBD');
    expect(match90?.team2).not.toBe('TBD');
    expect(match90?.projected).toBe(true);

    const match97 = tree.quarterFinals.find((match) => match.num === 97);
    expect(match97?.team1).not.toBe('TBD');
    expect(match97?.team2).not.toBe('TBD');
  });

  it('requires all group matches before R32 data is considered available', () => {
    const matches = [koMatch(73, 'Mexico', 'USA', 'roundOf32')];
    expect(r32DataAvailableFromServer(matches)).toBe(false);
  });

  it('formats feeder paths for later knockout rounds', () => {
    expect(formatFeederSlot('W73')).toBe('M73');
    expect(formatFeederSlot('L101')).toBe('Loser M101');
    expect(getBracketFeederTemplate(90)).toEqual({ team1: 'W73', team2: 'W75' });

    const tree = buildBracketTree(completeGroupStageMatches());
    const r16 = tree.roundOf16.find((match) => match.num === 90);
    expect(r16).toBeDefined();
    expect(bracketMatchShowsFeederPaths(r16!)).toBe(true);
  });

  it('carries confirmed knockout winners into the next round', () => {
    const base = completeGroupStageMatches();
    const projected = buildBracketTree(base);
    const m73 = projected.roundOf32.find((match) => match.num === 73)!;
    const m75 = projected.roundOf32.find((match) => match.num === 75)!;

    const matches = [
      ...base,
      koMatch(73, m73.team1, m73.team2, 'roundOf32', 2, 0),
      koMatch(75, m75.team1, m75.team2, 'roundOf32', 1, 0),
    ];

    const tree = buildBracketTree(matches);
    const m90 = tree.roundOf16.find((match) => match.num === 90);

    expect(m90?.team1).toBe(m73.team1);
    expect(m90?.team2).toBe(m75.team1);
    expect(bracketMatchShowsFeederPaths(m90!)).toBe(false);
  });

  it('carries winners through quarter-finals', () => {
    const base = completeGroupStageMatches();
    const projected = buildBracketTree(base);

    const r32Results = [73, 74, 75, 77].map((num) => {
      const match = projected.roundOf32.find((entry) => entry.num === num)!;
      return koMatch(num, match.team1, match.team2, 'roundOf32', 1, 0);
    });

    const afterR32 = buildBracketTree([...base, ...r32Results]);
    const m89 = afterR32.roundOf16.find((match) => match.num === 89)!;
    const m90 = afterR32.roundOf16.find((match) => match.num === 90)!;

    const matches = [
      ...base,
      ...r32Results,
      koMatch(89, m89.team1, m89.team2, 'roundOf16', 2, 1),
      koMatch(90, m90.team1, m90.team2, 'roundOf16', 1, 0),
    ];

    const tree = buildBracketTree(matches);
    const m97 = tree.quarterFinals.find((match) => match.num === 97);

    expect(m97?.team1).toBe(m89.team1);
    expect(m97?.team2).toBe(m90.team1);
    expect(bracketMatchShowsFeederPaths(m97!)).toBe(false);
  });
});
