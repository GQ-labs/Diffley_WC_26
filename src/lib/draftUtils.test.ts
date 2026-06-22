import { describe, expect, it } from 'vitest';
import draftConfig from '../../data/draft.json';
import type { DraftConfig } from '../types/config';
import {
  buildOwnerMap,
  getMatchOwners,
  getPlayerTeamSet,
  getTeamOwner,
  teamBelongsToPlayer,
} from './draftUtils';

const draft = draftConfig as DraftConfig;

describe('buildOwnerMap', () => {
  it('maps every drafted team to exactly one owner nickname', () => {
    const owners = buildOwnerMap(draft);
    const teams = draft.players.flatMap((player) => player.teams);

    expect(owners.size).toBe(48);
    expect(new Set(teams).size).toBe(48);

    for (const team of teams) {
      expect(owners.get(team)).toBeTruthy();
    }
  });

  it('uses player nicknames from draft.json', () => {
    const owners = buildOwnerMap(draft);

    expect(owners.get('Mexico')).toBe('Yuki');
    expect(owners.get('Ecuador')).toBe('Sam');
    expect(owners.get('Australia')).toBe('John');
    expect(owners.get('Ivory Coast')).toBe('Tom');
  });
});

describe('getTeamOwner', () => {
  const owners = buildOwnerMap(draft);

  it('returns the owner for a canonical team name', () => {
    expect(getTeamOwner('Belgium', owners)).toBe('Anne');
  });

  it('returns undefined for unknown or blank teams', () => {
    expect(getTeamOwner('Winner Match 73', owners)).toBeUndefined();
    expect(getTeamOwner('  ', owners)).toBeUndefined();
    expect(getTeamOwner('', owners)).toBeUndefined();
  });

  it('trims whitespace before lookup', () => {
    expect(getTeamOwner('  Spain  ', owners)).toBe('Anne');
  });
});

describe('getMatchOwners', () => {
  const owners = buildOwnerMap(draft);

  it('returns owners for both sides when both are lab teams', () => {
    expect(getMatchOwners('Mexico', 'South Africa', owners)).toEqual({
      team1Owner: 'Yuki',
      team2Owner: 'Anne',
    });
  });

  it('omits owner when team is not in the pool', () => {
    expect(getMatchOwners('Winner Match 73', 'Mexico', owners)).toEqual({
      team1Owner: undefined,
      team2Owner: 'Yuki',
    });
  });
});

describe('teamBelongsToPlayer', () => {
  const samTeams = getPlayerTeamSet(draft, 'sam');

  it('returns true when team is in the player set', () => {
    expect(teamBelongsToPlayer('Ecuador', samTeams)).toBe(true);
    expect(teamBelongsToPlayer('  Jordan  ', samTeams)).toBe(true);
  });

  it('returns false when team is not owned or filter is empty', () => {
    expect(teamBelongsToPlayer('Mexico', samTeams)).toBe(false);
    expect(teamBelongsToPlayer('Ecuador', new Set())).toBe(false);
    expect(teamBelongsToPlayer('', samTeams)).toBe(false);
  });
});
