import type { DraftConfig } from '../types/config';

export function buildOwnerMap(draft: DraftConfig): Map<string, string> {
  const map = new Map<string, string>();
  for (const player of draft.players) {
    for (const team of player.teams) {
      map.set(team, player.id);
    }
  }
  return map;
}
