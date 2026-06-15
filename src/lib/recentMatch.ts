import type { NormalizedMatch } from './types/match';

export interface LatestResult {
  date: string;
  round: string;
  team1: string;
  team2: string;
  homeScore: number;
  awayScore: number;
}

export function getLatestResult(
  matches: NormalizedMatch[],
): LatestResult | null {
  const played = matches
    .filter((m) => m.homeScore !== null && m.awayScore !== null)
    .sort((a, b) => `${b.date}|${b.id}`.localeCompare(`${a.date}|${a.id}`));

  const latest = played[0];
  if (!latest || latest.homeScore === null || latest.awayScore === null) {
    return null;
  }

  const round =
    latest.group ?? (latest.stage === 'group' ? 'Group stage' : latest.roundLabel);

  return {
    date: latest.date,
    round,
    team1: latest.team1,
    team2: latest.team2,
    homeScore: latest.homeScore,
    awayScore: latest.awayScore,
  };
}
