import { describe, expect, it } from 'vitest';
import { getPlayerTeamSet } from '../lib/draftUtils';
import { draftConfig } from '../config';
import { createPlayerTeamSet } from './usePlayerTeamSet';

describe('createPlayerTeamSet', () => {
  it('returns an empty set when no player is selected', () => {
    expect(createPlayerTeamSet('').size).toBe(0);
  });

  it('matches getPlayerTeamSet(draftConfig, id) — same source usePlayerTeamSet memoizes', () => {
    const expected = getPlayerTeamSet(draftConfig, 'sam');
    const fromFactory = createPlayerTeamSet('sam');

    expect(fromFactory.size).toBe(3);
    for (const team of expected) {
      expect(fromFactory.has(team)).toBe(true);
    }
  });
});
