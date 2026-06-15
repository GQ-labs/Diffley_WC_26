import { applyMatchOverrides } from './overrides';
import { normalizeOpenFootballMatch } from './scoring';
import { createTeamNormalizer } from './teamNames';
import type { NormalizedMatch } from './types/match';
import type { MatchOverride } from './overrides';

interface RawOpenFootballMatch {
  round?: string;
  date?: string;
  time?: string;
  team1?: string;
  team2?: string;
  group?: string;
  num?: number;
  score?: { ft?: number[]; pen?: number[] };
  penalty?: boolean;
}

interface OpenFootballRoot {
  matches?: RawOpenFootballMatch[];
}

export function parseOpenFootballJson(data: OpenFootballRoot): NormalizedMatch[] {
  const rawMatches = data.matches ?? [];
  const normalizeTeam = createTeamNormalizer();

  return rawMatches
    .map((raw, index) => normalizeOpenFootballMatch(raw, index, normalizeTeam))
    .filter((match): match is NormalizedMatch => match !== null);
}

export async function fetchOpenFootballJson(url: string): Promise<OpenFootballRoot> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Could not load results (HTTP ${response.status})`);
  }
  return (await response.json()) as OpenFootballRoot;
}

export async function loadTournamentMatches(
  url: string,
  overrides: MatchOverride[] = [],
): Promise<NormalizedMatch[]> {
  const data = await fetchOpenFootballJson(url);
  const matches = parseOpenFootballJson(data);
  return applyMatchOverrides(matches, overrides);
}
