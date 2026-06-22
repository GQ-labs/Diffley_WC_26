import { describe, expect, it } from 'vitest';
import type { NormalizedMatch } from './types/match';
import {
  formatKickoffUk,
  getUpcomingMatchday,
  getUsTournamentDate,
  parseOpenFootballKickoff,
} from './upcomingMatches';

function scheduledMatch(
  overrides: Partial<NormalizedMatch>,
): NormalizedMatch {
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
    group: 'Group A',
    ...overrides,
  };
}

describe('parseOpenFootballKickoff', () => {
  it('parses UTC offset kickoff times', () => {
    const kickoff = parseOpenFootballKickoff('2026-06-11', '20:00 UTC-6');
    expect(kickoff?.toISOString()).toBe('2026-06-12T02:00:00.000Z');
  });
});

describe('getUsTournamentDate', () => {
  it('uses US Eastern date when UK is already on the next calendar day', () => {
    const ukEarlyMorning = new Date('2026-06-15T02:00:00+01:00');
    expect(getUsTournamentDate(ukEarlyMorning)).toBe('2026-06-14');
  });
});

describe('getUpcomingMatchday', () => {
  it('groups by US matchday and sorts by kickoff', () => {
    const matches = [
      scheduledMatch({
        id: 'g1',
        team1: 'Mexico',
        team2: 'South Africa',
        kickoffTime: '13:00 UTC-6',
      }),
      scheduledMatch({
        id: 'g2',
        team1: 'Korea',
        team2: 'Czechia',
        kickoffTime: '20:00 UTC-6',
      }),
    ];

    const now = new Date('2026-06-11T10:00:00-04:00');
    const result = getUpcomingMatchday(matches, now);

    expect(result?.matchdayDate).toBe('2026-06-11');
    expect(result?.matches).toHaveLength(2);
    expect(result?.matches[0].team1).toBe('Mexico');
    expect(result?.matches[1].team1).toBe('Korea');
    expect(result?.matches[1].kickoffUkLabel).toBe(
      formatKickoffUk(parseOpenFootballKickoff('2026-06-11', '20:00 UTC-6')!),
    );
  });

  it('advances to the next US matchday when today is finished', () => {
    const matches = [
      scheduledMatch({ id: 'g1', date: '2026-06-11', kickoffTime: '13:00 UTC-6' }),
      scheduledMatch({
        id: 'g2',
        date: '2026-06-12',
        team1: 'Canada',
        team2: 'Bosnia',
        kickoffTime: '15:00 UTC-4',
      }),
    ];

    const now = new Date('2026-06-12T01:00:00-04:00');
    const result = getUpcomingMatchday(matches, now);

    expect(result?.matchdayDate).toBe('2026-06-12');
    expect(result?.matches[0].team1).toBe('Canada');
  });
});
