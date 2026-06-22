import { describe, expect, it } from 'vitest';
import { parseCache, serializeCache } from './cache';
import type { NormalizedMatch } from './types/match';

const sampleMatch: NormalizedMatch = {
  id: 'm1',
  team1: 'Mexico',
  team2: 'USA',
  homeScore: 2,
  awayScore: 1,
  roundLabel: 'Round of 32',
  stage: 'knockout',
  knockoutRound: 'roundOf32',
  date: '2026-06-28',
  decidedByPenalties: false,
};

describe('cache', () => {
  it('round-trips match data through JSON', () => {
    const fetchedAt = new Date('2026-06-15T12:00:00.000Z');
    const raw = serializeCache([sampleMatch], fetchedAt);
    const parsed = parseCache(raw);

    expect(parsed?.fetchedAt).toBe(fetchedAt.toISOString());
    expect(parsed?.matches).toHaveLength(1);
    expect(parsed?.matches[0]?.team1).toBe('Mexico');
  });

  it('returns null for invalid cache JSON', () => {
    expect(parseCache('not json')).toBeNull();
    expect(parseCache('{}')).toBeNull();
  });
});
