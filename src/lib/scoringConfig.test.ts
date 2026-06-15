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

  it('defines cumulative knockout milestone bonuses', () => {
    expect(scoring.knockoutMilestone).toEqual({
      description: expect.any(String),
      groupExit: 0,
      roundOf32: 2,
      roundOf16: 4,
      quarterFinal: 6,
      semiFinal: 8,
      final: 0,
      winner: 0,
    });
  });

  it('includes rules copy for the Rules tab', () => {
    expect(scoring.rulesText.summary).toMatch(/cumulative/i);
    expect(scoring.rulesText.matchPoints).toMatch(/Win = 3/);
    expect(scoring.rulesText.penalties).toMatch(/penalt/i);
    expect(scoring.rulesText.milestone).toMatch(/openfootball/i);
    expect(scoring.rulesText.playerTotal).toMatch(/three teams/i);
  });
});
