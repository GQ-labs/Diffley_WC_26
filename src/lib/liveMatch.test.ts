import { describe, expect, it } from 'vitest';
import type { NormalizedMatch } from './types/match';
import { findKickoffWindowMatch, pickCurrentMatch } from './liveMatch';

function match(partial: Partial<NormalizedMatch>): NormalizedMatch {
  return {
    id: 'g1',
    team1: 'Mexico',
    team2: 'South Africa',
    homeScore: null,
    awayScore: null,
    roundLabel: 'Matchday 1',
    stage: 'group',
    knockoutRound: null,
    date: '2026-06-11',
    kickoffTime: '13:00 UTC-6',
    decidedByPenalties: false,
    ...partial,
  };
}

describe('findKickoffWindowMatch', () => {
  it('returns a match during the live kickoff window', () => {
    const kickoff = new Date('2026-06-11T19:00:00Z');
    const now = new Date(kickoff.getTime() + 30 * 60 * 1000);
    const current = findKickoffWindowMatch(
      [match({ kickoffTime: '13:00 UTC-6' })],
      now,
    );
    expect(current?.team1).toBe('Mexico');
    expect(current?.isLive).toBe(true);
  });

  it('returns null after the live window ends', () => {
    const kickoff = new Date('2026-06-11T19:00:00Z');
    const now = new Date(kickoff.getTime() + 3 * 60 * 60 * 1000);
    expect(findKickoffWindowMatch([match({})], now)).toBeNull();
  });
});

describe('pickCurrentMatch', () => {
  it('prefers FIFA live feed over kickoff window', () => {
    const current = pickCurrentMatch(
      [
        {
          IdMatch: '1',
          Date: '2026-06-12T02:00:00Z',
          MatchStatus: 2,
          MatchTime: "34'",
          HomeTeamScore: 1,
          AwayTeamScore: 0,
          Home: { TeamName: [{ Locale: 'en-GB', Description: 'Korea Republic' }] },
          Away: { TeamName: [{ Locale: 'en-GB', Description: 'Czechia' }] },
        },
      ],
      [match({ team1: 'Korea', team2: 'Czechia', kickoffTime: '20:00 UTC-6' })],
      new Date('2026-06-12T02:34:00Z'),
    );

    expect(current?.team1).toBe('Korea');
    expect(current?.homeScore).toBe(1);
    expect(current?.minute).toBe("34'");
  });
});
