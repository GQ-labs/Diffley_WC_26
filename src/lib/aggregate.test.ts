import { describe, expect, it } from 'vitest';
import draftConfig from '../../data/draft.json';
import scoringConfig from '../../data/scoring.json';
import { buildPlayerStandings } from './aggregate';
import type { NormalizedMatch } from './types/match';
import type { DraftConfig, ScoringConfig } from '../types/config';

const draft = draftConfig as DraftConfig;
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
    ...partial,
  };
}

describe('player standings', () => {
  it('aggregates all three teams for a player', () => {
    const matches: NormalizedMatch[] = [
      match({ id: 'b1', team1: 'Brazil', team2: 'Morocco', homeScore: 1, awayScore: 1 }),
      match({ id: 'b2', team1: 'Brazil', team2: 'Haiti', homeScore: 3, awayScore: 0, date: '2026-06-19' }),
      match({ id: 'i1', team1: 'Iraq', team2: 'Norway', homeScore: 0, awayScore: 2 }),
      match({ id: 'a1', team1: 'Argentina', team2: 'Algeria', homeScore: 2, awayScore: 0 }),
    ];

    const standings = buildPlayerStandings(draft, matches, scoring);
    const berta = standings.find((p) => p.id === 'berta');

    expect(berta).toBeDefined();
    expect(berta!.teams).toEqual(['Brazil', 'Iraq', 'Argentina']);
    expect(berta!.matchPoints).toBe(7); // Brazil 4, Iraq 0, Argentina 3
    expect(berta!.totalPoints).toBe(berta!.matchPoints + berta!.milestonePoints);
  });

  it('returns 16 ranked players', () => {
    const standings = buildPlayerStandings(draft, [], scoring);
    expect(standings).toHaveLength(16);
    expect(standings[0].rank).toBe(1);
    expect(standings[15].rank).toBe(16);
  });

  it('sorts by total points descending', () => {
    const matches: NormalizedMatch[] = [
      match({ id: '1', team1: 'Brazil', team2: 'Haiti', homeScore: 5, awayScore: 0 }),
      match({ id: '2', team1: 'Japan', team2: 'Tunisia', homeScore: 2, awayScore: 0 }),
    ];

    const standings = buildPlayerStandings(draft, matches, scoring);
    expect(standings[0].totalPoints).toBeGreaterThanOrEqual(standings[1].totalPoints);
  });
});
