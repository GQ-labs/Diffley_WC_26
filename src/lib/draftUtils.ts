import type { DraftConfig } from '../types/config';

export function buildOwnerMap(draft: DraftConfig): Map<string, string> {
  const map = new Map<string, string>();
  for (const player of draft.players) {
    for (const team of player.teams) {
      map.set(team, player.name);
    }
  }
  return map;
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
