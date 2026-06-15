import { describe, expect, it } from 'vitest';
import teamAliases from '../../data/team-aliases.json';
import { TEAM_ISO } from './teamIso';

describe('team flag mapping', () => {
  it('maps every canonical team to an ISO code', () => {
    const teams = teamAliases.canonicalTeams as string[];
    const missing = teams.filter((team) => !TEAM_ISO[team]);
    expect(missing).toEqual([]);
  });
});
