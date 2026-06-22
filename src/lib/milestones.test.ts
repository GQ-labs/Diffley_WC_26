import { describe, expect, it } from 'vitest';
import {
  hasQualifiedForRoundOf32,
  hasReachedKnockoutStage,
  inferTeamMilestone,
} from './milestones';
import type { NormalizedMatch } from './types/match';
import {
  completeGroupStageMatches,
  placeholderR32Except,
} from './testFixtures';

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
    ...partial,
  };
}

describe('milestones', () => {
  it('promotes winner only after winning the final', () => {
    const matches = [
      match({
        id: 'm101',
        team1: 'Spain',
        team2: 'Germany',
        homeScore: 2,
        awayScore: 1,
        stage: 'knockout',
        knockoutRound: 'semiFinal',
        roundLabel: 'Semi-final',
      }),
      match({
        id: 'm104',
        team1: 'Spain',
        team2: 'France',
        homeScore: null,
        awayScore: null,
        stage: 'knockout',
        knockoutRound: 'final',
        roundLabel: 'Final',
      }),
    ];
    expect(inferTeamMilestone('Spain', matches)).toBe('final');
    expect(hasReachedKnockoutStage('Spain', 'final', matches)).toBe(true);
  });

  it('qualifies from confirmed R32 listing after group stage is complete', () => {
    const matches = [
      ...completeGroupStageMatches(),
      match({
        team1: 'Mexico',
        team2: 'USA',
        homeScore: null,
        awayScore: null,
        stage: 'knockout',
        knockoutRound: 'roundOf32',
        roundLabel: 'Round of 32',
        id: 'm73',
      }),
      ...placeholderR32Except(73),
    ];
    expect(hasQualifiedForRoundOf32('Mexico', matches)).toBe(true);
    expect(inferTeamMilestone('Mexico', matches)).toBe('roundOf32');
  });
});
