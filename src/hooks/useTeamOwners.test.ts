import { describe, expect, it } from 'vitest';
import { buildOwnerMap } from '../lib/draftUtils';
import { draftConfig } from '../config';
import { createTeamOwnerMap } from './useTeamOwners';

describe('createTeamOwnerMap', () => {
  it('matches buildOwnerMap(draftConfig) — same source useTeamOwners memoizes', () => {
    const expected = buildOwnerMap(draftConfig);
    const fromFactory = createTeamOwnerMap();

    expect(fromFactory.size).toBe(expected.size);
    for (const [team, owner] of expected) {
      expect(fromFactory.get(team)).toBe(owner);
    }
  });
});
