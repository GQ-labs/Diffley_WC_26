import type { DraftConfig } from '../types/config';

/** Canonical team name → lab member nickname. */
export type TeamOwnerMap = ReadonlyMap<string, string>;

export function buildOwnerMap(draft: DraftConfig): TeamOwnerMap {
  const map = new Map<string, string>();
  for (const player of draft.players) {
    for (const team of player.teams) {
      map.set(team, player.name);
    }
  }
  return map;
}

export function getTeamOwner(
  team: string,
  owners: TeamOwnerMap,
): string | undefined {
  const trimmed = team.trim();
  if (!trimmed) return undefined;
  return owners.get(trimmed);
}

export interface MatchOwners {
  team1Owner?: string;
  team2Owner?: string;
}

export function getMatchOwners(
  team1: string,
  team2: string,
  owners: TeamOwnerMap,
): MatchOwners {
  return {
    team1Owner: getTeamOwner(team1, owners),
    team2Owner: getTeamOwner(team2, owners),
  };
}

export function getPlayerTeams(
  draft: DraftConfig,
  playerId: string,
): string[] {
  if (!playerId) return [];
  return draft.players.find((player) => player.id === playerId)?.teams ?? [];
}

export function getPlayerTeamSet(
  draft: DraftConfig,
  playerId: string,
): Set<string> {
  return new Set(getPlayerTeams(draft, playerId));
}

export function matchInvolvesPlayerTeams(
  team1: string,
  team2: string,
  playerTeams: Set<string>,
): boolean {
  if (playerTeams.size === 0) return true;
  return playerTeams.has(team1) || playerTeams.has(team2);
}

export function teamBelongsToPlayer(
  team: string,
  playerTeams: Set<string>,
): boolean {
  if (playerTeams.size === 0) return false;
  const trimmed = team.trim();
  return trimmed ? playerTeams.has(trimmed) : false;
}
