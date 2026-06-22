import type { NormalizedMatch } from './types/match';
import { normalizeTeamName } from './teamNames';
import { parseOpenFootballKickoff } from './upcomingMatches';

const FIFA_CALENDAR_URL =
  'https://api.fifa.com/api/v3/calendar/matches?count=500&idSeason=285023&idCompetition=17';

/** FIFA MatchStatus: 0 = finished, 1 = scheduled; other values = in progress. */
const FIFA_FINISHED = 0;
const FIFA_SCHEDULED = 1;

const LIVE_KICKOFF_WINDOW_MS = 105 * 60 * 1000;
const FIFA_STATUS_LABELS: Record<number, string> = {
  2: '1st half',
  3: 'Half-time',
  4: 'Break',
  5: '2nd half',
  6: 'Extra time',
  7: 'Extra time break',
  8: 'Penalties',
};

export interface CurrentMatch {
  id: string;
  team1: string;
  team2: string;
  homeScore: number;
  awayScore: number;
  minute: string | null;
  statusLabel: string;
  matchdayDate: string;
  isLive: boolean;
}

interface FifaTeamSide {
  TeamName?: { Locale: string; Description: string }[];
}

interface FifaCalendarMatch {
  IdMatch: string;
  Date: string;
  MatchStatus: number;
  MatchTime: string | null;
  ResultType?: number;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  Home?: FifaTeamSide | null;
  Away?: FifaTeamSide | null;
}

function fifaTeamLabel(team?: FifaTeamSide | null): string {
  return (
    team?.TeamName?.find((entry) => entry.Locale === 'en-GB')?.Description ??
    team?.TeamName?.[0]?.Description ??
    ''
  );
}

function isFifaFinished(match: FifaCalendarMatch): boolean {
  return match.MatchStatus === FIFA_FINISHED && match.ResultType === 1;
}

function isFifaLive(match: FifaCalendarMatch): boolean {
  if (isFifaFinished(match)) return false;
  if (match.MatchStatus === FIFA_SCHEDULED) return false;
  if (match.MatchStatus !== FIFA_FINISHED && match.MatchStatus !== FIFA_SCHEDULED) {
    return true;
  }
  return match.HomeTeamScore !== null && match.AwayTeamScore !== null;
}

function fifaStatusLabel(match: FifaCalendarMatch): string {
  if (match.MatchTime) return match.MatchTime;
  return FIFA_STATUS_LABELS[match.MatchStatus] ?? 'Live';
}

function fromFifaMatch(match: FifaCalendarMatch): CurrentMatch | null {
  const home = normalizeTeamName(fifaTeamLabel(match.Home));
  const away = normalizeTeamName(fifaTeamLabel(match.Away));
  if (!home || !away) return null;

  return {
    id: `fifa-${match.IdMatch}`,
    team1: home,
    team2: away,
    homeScore: match.HomeTeamScore ?? 0,
    awayScore: match.AwayTeamScore ?? 0,
    minute: match.MatchTime,
    statusLabel: fifaStatusLabel(match),
    matchdayDate: match.Date.slice(0, 10),
    isLive: isFifaLive(match),
  };
}

export function findKickoffWindowMatch(
  matches: NormalizedMatch[],
  now: Date = new Date(),
): CurrentMatch | null {
  const nowMs = now.getTime();
  let best: { match: NormalizedMatch; kickoff: Date } | null = null;

  for (const match of matches) {
    if (match.homeScore !== null && match.awayScore !== null) continue;
    const kickoff = parseOpenFootballKickoff(match.date, match.kickoffTime);
    if (!kickoff) continue;

    const elapsed = nowMs - kickoff.getTime();
    if (elapsed < 0 || elapsed >= LIVE_KICKOFF_WINDOW_MS) continue;

    if (!best || kickoff.getTime() > best.kickoff.getTime()) {
      best = { match, kickoff };
    }
  }

  if (!best) return null;

  return {
    id: best.match.id,
    team1: best.match.team1,
    team2: best.match.team2,
    homeScore: best.match.homeScore ?? 0,
    awayScore: best.match.awayScore ?? 0,
    minute: null,
    statusLabel: 'In progress',
    matchdayDate: best.match.date,
    isLive: true,
  };
}

export function pickCurrentMatch(
  fifaMatches: FifaCalendarMatch[],
  localMatches: NormalizedMatch[],
  now: Date = new Date(),
): CurrentMatch | null {
  const liveFromFifa = fifaMatches
    .filter(isFifaLive)
    .map(fromFifaMatch)
    .filter((match): match is CurrentMatch => match !== null);

  if (liveFromFifa.length > 0) {
    return liveFromFifa[0];
  }

  const kickoffMatch = findKickoffWindowMatch(localMatches, now);
  if (!kickoffMatch) return null;

  const fifaMirror = fifaMatches
    .map(fromFifaMatch)
    .find(
      (match) =>
        match &&
        ((match.team1 === kickoffMatch.team1 && match.team2 === kickoffMatch.team2) ||
          (match.team1 === kickoffMatch.team2 && match.team2 === kickoffMatch.team1)),
    );

  if (fifaMirror && fifaMirror.isLive) {
    return fifaMirror;
  }

  if (fifaMirror && !fifaMirror.isLive) return null;

  return kickoffMatch;
}

export async function fetchFifaCalendarMatches(): Promise<FifaCalendarMatch[]> {
  const response = await fetch(FIFA_CALENDAR_URL, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`FIFA live feed HTTP ${response.status}`);
  }
  const data = (await response.json()) as { Results?: FifaCalendarMatch[] };
  return data.Results ?? [];
}

export async function resolveCurrentMatch(
  localMatches: NormalizedMatch[],
  now: Date = new Date(),
): Promise<CurrentMatch | null> {
  try {
    const fifaMatches = await fetchFifaCalendarMatches();
    return pickCurrentMatch(fifaMatches, localMatches, now);
  } catch {
    return findKickoffWindowMatch(localMatches, now);
  }
}
