import { describe, expect, it } from 'vitest';
import scoringConfig from '../../data/scoring.json';
import type { ScoringConfig } from '../types/config';

const scoring = scoringConfig as ScoringConfig;

describe('scoring.json', () => {
  it('defines frozen match points', () => {
    expect(scoring.match).toEqual({
      win: 3,
      draw: 1,
      loss: 0,
      penaltyShootoutCountsAsDraw: true,
    });
  });

  it('defines +1 per knockout round reached', () => {
    expect(scoring.knockoutMilestone).toEqual({
      description: expect.any(String),
      groupExit: 0,
      roundOf32: 1,
      roundOf16: 1,
      quarterFinal: 1,
      semiFinal: 1,
      final: 1,
      winner: 0,
    });
  });

  it('includes rules copy for the Rules tab', () => {
    expect(scoring.rulesText.summary).toMatch(/knockout round/i);
    expect(scoring.rulesText.matchPoints).toMatch(/Win = 3/);
    expect(scoring.rulesText.penalties).toMatch(/penalt/i);
    expect(scoring.rulesText.milestone).toMatch(/openfootball/i);
    expect(scoring.rulesText.playerTotal).toMatch(/three teams/i);
  });
});
