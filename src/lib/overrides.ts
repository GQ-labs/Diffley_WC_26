import { createTeamNormalizer } from './teamNames';
import type { NormalizedMatch } from './types/match';

export interface MatchOverride {
  /** Match id from openfootball, e.g. "m73" */
  id?: string;
  /** openfootball match number, e.g. 73 */
  num?: number;
  team1?: string;
  team2?: string;
  homeScore: number;
  awayScore: number;
  decidedByPenalties?: boolean;
  reason?: string;
}

export interface OverridesConfig {
  matches: MatchOverride[];
}

function matchesOverrideTarget(
  match: NormalizedMatch,
  override: MatchOverride,
  normalizeTeam: (name: string) => string,
): boolean {
  if (override.id && match.id === override.id) return true;
  if (override.num !== undefined && match.id === `m${override.num}`) return true;

  if (override.team1 && override.team2) {
    const t1 = normalizeTeam(override.team1);
    const t2 = normalizeTeam(override.team2);
    return (
      (match.team1 === t1 && match.team2 === t2) ||
      (match.team1 === t2 && match.team2 === t1)
    );
  }

  return false;
}

export function applyMatchOverrides(
  matches: NormalizedMatch[],
  overrides: MatchOverride[],
): NormalizedMatch[] {
  if (!overrides.length) return matches;

  const normalizeTeam = createTeamNormalizer();

  return matches.map((match) => {
    const override = overrides.find((o) =>
      matchesOverrideTarget(match, o, normalizeTeam),
    );
    if (!override) return match;

    return {
      ...match,
      homeScore: override.homeScore,
      awayScore: override.awayScore,
      decidedByPenalties:
        override.decidedByPenalties ?? match.decidedByPenalties,
    };
  });
}

export function countAppliedOverrides(
  matches: NormalizedMatch[],
  overrides: MatchOverride[],
): number {
  if (!overrides.length) return 0;
  const normalizeTeam = createTeamNormalizer();
  return overrides.filter((o) =>
    matches.some((m) => matchesOverrideTarget(m, o, normalizeTeam)),
  ).length;
}
