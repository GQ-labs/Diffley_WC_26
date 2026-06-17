import { useMemo } from 'react';
import { draftConfig } from '../config';
import { buildOwnerMap, type TeamOwnerMap } from '../lib/draftUtils';

/** Owner map from bundled draft config (pure; used by hook and tests). */
export function createTeamOwnerMap(): TeamOwnerMap {
  return buildOwnerMap(draftConfig);
}

/** Lab member nickname for each canonical team name (from draft.json). */
export function useTeamOwners(): TeamOwnerMap {
  return useMemo(() => createTeamOwnerMap(), []);
}
