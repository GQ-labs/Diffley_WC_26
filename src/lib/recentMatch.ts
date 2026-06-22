import type { NormalizedMatch } from './types/match';
import { parseOpenFootballKickoff } from './upcomingMatches';

export interface LatestResult {
  id: string;
  date: string;
  round: string;
  team1: string;
  team2: string;
  homeScore: number;
  awayScore: number;
}

function toLatestResult(match: NormalizedMatch): LatestResult | null {
  if (match.homeScore === null || match.awayScore === null) return null;

  const round =
    match.group ?? (match.stage === 'group' ? 'Group stage' : match.roundLabel);

  return {
    id: match.id,
    date: match.date,
    round,
    team1: match.team1,
    team2: match.team2,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
  };
}

function matchNumFromId(id: string): number {
  const match = id.match(/^m(\d+)$/i);
  return match ? Number(match[1]) : 0;
}

/** Sort key: kickoff instant, latest start first. */
function getKickoffSortMs(match: NormalizedMatch): number {
  const kickoff = parseOpenFootballKickoff(match.date, match.kickoffTime);
  if (kickoff) {
    return kickoff.getTime();
  }

  const dayStart = Date.parse(`${match.date}T12:00:00Z`);
  return dayStart + matchNumFromId(match.id);
}

function sortPlayedMatches(matches: NormalizedMatch[]): NormalizedMatch[] {
  return matches
    .filter((match) => match.homeScore !== null && match.awayScore !== null)
    .sort((a, b) => getKickoffSortMs(b) - getKickoffSortMs(a));
}

export function getLatestResults(  matches: NormalizedMatch[],
  limit = 3,
): LatestResult[] {
  return sortPlayedMatches(matches)
    .slice(0, limit)
    .map(toLatestResult)
    .filter((result): result is LatestResult => result !== null);
}

export function getLatestResult(
  matches: NormalizedMatch[],
): LatestResult | null {
  return getLatestResults(matches, 1)[0] ?? null;
}
