import { describe, expect, it } from 'vitest';
import scoringConfig from '../../data/scoring.json';
import {
  getCumulativeMilestonePoints,
  hasQualifiedForRoundOf32,
  hasReachedKnockoutStage,
  inferTeamMilestone,
  isTeamSlottedInRound,
  wonKnockoutRound,
} from './milestones';
import {
  buildTeamStanding,
  getMatchOutcome,
  getMatchPoints,
} from './scoring';
import type { NormalizedMatch } from './types/match';
import type { ScoringConfig } from '../types/config';

const scoring = scoringConfig as ScoringConfig;

function match(
  partial: Partial<NormalizedMatch> & Pick<NormalizedMatch, 'team1' | 'team2'>,
): NormalizedMatch {
  return {
    id: partial.id ?? 'm1',
    homeScore: partial.homeScore ?? null,
    awayScore: partial.awayScore ?? null,
    roundLabel: partial.roundLabel ?? 'Matchday 1',
    stage: partial.stage ?? 'group',
    knockoutRound: partial.knockoutRound ?? null,
    date: partial.date ?? '2026-06-11',
    decidedByPenalties: partial.decidedByPenalties ?? false,
    group: partial.group,
    ...partial,
  };
}

describe('match points', () => {
  it('awards 3 for a win', () => {
    const m = match({ team1: 'Brazil', team2: 'Haiti', homeScore: 2, awayScore: 0 });
    expect(getMatchOutcome('Brazil', m)).toBe('win');
    expect(getMatchPoints('win', scoring)).toBe(3);
  });

  it('treats penalty shootout as draw for match points', () => {
    const m = match({
      team1: 'Japan',
      team2: 'Netherlands',
      homeScore: 2,
      awayScore: 2,
      stage: 'knockout',
      knockoutRound: 'roundOf16',
      roundLabel: 'Round of 16',
      decidedByPenalties: true,
    });
    expect(getMatchOutcome('Japan', m)).toBe('draw');
    expect(getMatchPoints('draw', scoring)).toBe(1);
  });
});

describe('knockout milestones from openfootball fixtures', () => {
  it('does not award R32 bonus from group results alone', () => {
    const matches = [
      match({ id: 'g1', group: 'Group A', team1: 'Mexico', team2: 'South Africa', homeScore: 2, awayScore: 0 }),
      match({ id: 'g2', group: 'Group A', team1: 'Korea', team2: 'Czechia', homeScore: 2, awayScore: 1 }),
      match({ id: 'g3', group: 'Group A', team1: 'Czechia', team2: 'South Africa', homeScore: 0, awayScore: 1 }),
      match({ id: 'g4', group: 'Group A', team1: 'Mexico', team2: 'Korea', homeScore: 1, awayScore: 1 }),
      match({ id: 'g5', group: 'Group A', team1: 'Czechia', team2: 'Mexico', homeScore: 0, awayScore: 2 }),
      match({ id: 'g6', group: 'Group A', team1: 'South Africa', team2: 'Korea', homeScore: 0, awayScore: 2 }),
    ];
    expect(inferTeamMilestone('Mexico', matches)).toBe('groupExit');
    expect(inferTeamMilestone('Czechia', matches)).toBe('groupExit');
  });

  it('awards R32 when openfootball slots a real team name in Round of 32', () => {
    const matches = [
      match({
        id: 'k1',
        team1: 'Mexico',
        team2: '2B',
        homeScore: null,
        awayScore: null,
        stage: 'knockout',
        knockoutRound: 'roundOf32',
        roundLabel: 'Round of 32',
      }),
    ];
    expect(hasQualifiedForRoundOf32('Mexico', matches)).toBe(true);
    expect(inferTeamMilestone('Mexico', matches)).toBe('roundOf32');
    expect(getCumulativeMilestonePoints('Mexico', matches, scoring.knockoutMilestone)).toBe(1);
  });

  it('ignores placeholder-only R32 fixtures', () => {
    const matches = [
      match({
        id: 'k1',
        team1: '2A',
        team2: '2B',
        stage: 'knockout',
        knockoutRound: 'roundOf32',
        roundLabel: 'Round of 32',
      }),
    ];
    expect(isTeamSlottedInRound('Mexico', 'roundOf32', matches)).toBe(false);
  });

  it('keeps R32 bonus for a team eliminated in round of 32', () => {
    const matches = [
      match({
        id: 'k1',
        team1: 'Mexico',
        team2: 'USA',
        homeScore: 2,
        awayScore: 1,
        stage: 'knockout',
        knockoutRound: 'roundOf32',
        roundLabel: 'Round of 32',
      }),
    ];
    expect(inferTeamMilestone('USA', matches)).toBe('roundOf32');
    expect(inferTeamMilestone('Mexico', matches)).toBe('roundOf16');
  });

  it('awards R16 when team wins R32 before R16 kicks off', () => {
    const matches = [
      match({
        id: 'k1',
        team1: 'Mexico',
        team2: 'USA',
        homeScore: 2,
        awayScore: 0,
        stage: 'knockout',
        knockoutRound: 'roundOf32',
        roundLabel: 'Round of 32',
      }),
      match({
        id: 'k2',
        team1: 'Mexico',
        team2: 'W78',
        homeScore: null,
        awayScore: null,
        stage: 'knockout',
        knockoutRound: 'roundOf16',
        roundLabel: 'Round of 16',
      }),
    ];
    expect(inferTeamMilestone('Mexico', matches)).toBe('roundOf16');
    expect(wonKnockoutRound('Mexico', 'roundOf32', matches)).toBe(true);
  });

  it('awards semi-final to winner and quarter-final to loser of QF', () => {
    const matches = [
      match({
        id: 'k1',
        team1: 'Brazil',
        team2: 'France',
        homeScore: 0,
        awayScore: 1,
        stage: 'knockout',
        knockoutRound: 'quarterFinal',
        roundLabel: 'Quarter-final',
      }),
    ];
    expect(inferTeamMilestone('France', matches)).toBe('semiFinal');
    expect(inferTeamMilestone('Brazil', matches)).toBe('quarterFinal');
  });

  it('awards final bonus to finalists', () => {
    const scheduled = [
      match({
        id: 'f',
        team1: 'Argentina',
        team2: 'France',
        homeScore: null,
        awayScore: null,
        stage: 'knockout',
        knockoutRound: 'final',
        roundLabel: 'Final',
      }),
    ];
    expect(inferTeamMilestone('Argentina', scheduled)).toBe('final');
    expect(hasReachedKnockoutStage('France', 'final', scheduled)).toBe(true);

    const played = [
      match({
        id: 'f',
        team1: 'Argentina',
        team2: 'France',
        homeScore: 3,
        awayScore: 4,
        stage: 'knockout',
        knockoutRound: 'final',
        roundLabel: 'Final',
      }),
    ];
    expect(inferTeamMilestone('France', played)).toBe('winner');
    expect(inferTeamMilestone('Argentina', played)).toBe('final');
  });
});

describe('team standing totals', () => {
  it('sums match points and milestone bonus', () => {
    const matches = [
      match({ id: 'g1', group: 'Group A', team1: 'Mexico', team2: 'South Africa', homeScore: 2, awayScore: 0 }),
      match({ id: 'g2', group: 'Group A', team1: 'Mexico', team2: 'Korea', homeScore: 1, awayScore: 1 }),
      match({ id: 'g3', group: 'Group A', team1: 'Czechia', team2: 'Mexico', homeScore: 0, awayScore: 2 }),
      match({
        id: 'k1',
        team1: 'Mexico',
        team2: 'USA',
        homeScore: 1,
        awayScore: 0,
        stage: 'knockout',
        knockoutRound: 'roundOf32',
        roundLabel: 'Round of 32',
      }),
      match({
        id: 'k2',
        team1: 'Mexico',
        team2: 'Germany',
        homeScore: 0,
        awayScore: 2,
        stage: 'knockout',
        knockoutRound: 'roundOf16',
        roundLabel: 'Round of 16',
      }),
    ];

    const standing = buildTeamStanding('Mexico', matches, scoring);
    expect(standing.matchPoints).toBe(10);
    expect(standing.milestoneKey).toBe('roundOf16');
    expect(standing.milestonePoints).toBe(2);
    expect(standing.totalPoints).toBe(12);
  });

  it('adds +1 per knockout round reached', () => {
    const matches = [
      match({
        id: 'k1',
        team1: 'Brazil',
        team2: 'France',
        homeScore: 0,
        awayScore: 1,
        stage: 'knockout',
        knockoutRound: 'quarterFinal',
        roundLabel: 'Quarter-final',
      }),
    ];
    expect(getCumulativeMilestonePoints('France', matches, scoring.knockoutMilestone)).toBe(2);
    expect(getCumulativeMilestonePoints('Brazil', matches, scoring.knockoutMilestone)).toBe(1);
  });
});
