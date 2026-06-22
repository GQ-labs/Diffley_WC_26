import { useMemo } from 'react';
import { draftConfig } from '../config';
import { getPlayerTeamSet } from '../lib/draftUtils';

/** Pure factory for tests and hook. */
export function createPlayerTeamSet(playerFilter: string): Set<string> {
  return getPlayerTeamSet(draftConfig, playerFilter);
}

/** Teams owned by the filtered player; empty set when showing all players. */
export function usePlayerTeamSet(playerFilter: string): Set<string> {
  return useMemo(
    () => createPlayerTeamSet(playerFilter),
    [playerFilter],
  );
}
