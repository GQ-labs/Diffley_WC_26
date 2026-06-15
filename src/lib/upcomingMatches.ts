import type { NormalizedMatch } from './types/match';

const US_TOURNAMENT_TIMEZONE = 'America/New_York';
const UK_DISPLAY_TIMEZONE = 'Europe/London';
const LIVE_WINDOW_MS = 2 * 60 * 60 * 1000;

export interface UpcomingMatch {
  id: string;
  team1: string;
  team2: string;
  /** US/local tournament matchday from openfootball */
  matchdayDate: string;
  roundLabel: string;
  group?: string;
  kickoffUkLabel: string;
  kickoffUtc: Date;
}

export interface UpcomingMatchday {
  matchdayDate: string;
  matchdayLabel: string;
  matches: UpcomingMatch[];
}

/** Tournament calendar day in US Eastern (host reference). */
export function getUsTournamentDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: US_TOURNAMENT_TIMEZONE,
  }).format(now);
}

/** Parse openfootball kickoff, e.g. "20:00 UTC-6" on "2026-06-11". */
export function parseOpenFootballKickoff(
  date: string,
  time?: string,
): Date | null {
  if (!date || !time) return null;

  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s+UTC([+-])(\d{1,2})$/i);
  if (!match) return null;

  const hours = match[1].padStart(2, '0');
  const minutes = match[2];
  const sign = match[3];
  const offsetHours = match[4].padStart(2, '0');
  const iso = `${date}T${hours}:${minutes}:00${sign}${offsetHours}:00`;

  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatKickoffUk(kickoff: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UK_DISPLAY_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(kickoff);
}

function formatMatchdayLabel(matchdayDate: string): string {
  const [year, month, day] = matchdayDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: US_TOURNAMENT_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function isScheduled(match: NormalizedMatch): boolean {
  return match.homeScore === null || match.awayScore === null;
}

function toUpcomingMatch(match: NormalizedMatch): UpcomingMatch {
  const kickoffUtc =
    parseOpenFootballKickoff(match.date, match.kickoffTime) ??
    new Date(`${match.date}T12:00:00Z`);

  return {
    id: match.id,
    team1: match.team1,
    team2: match.team2,
    matchdayDate: match.date,
    roundLabel: match.group ?? match.roundLabel,
    group: match.group,
    kickoffUkLabel: formatKickoffUk(kickoffUtc),
    kickoffUtc,
  };
}

function upcomingOnMatchday(
  scheduled: NormalizedMatch[],
  matchdayDate: string,
  nowMs: number,
): UpcomingMatch[] {
  return scheduled
    .filter((match) => match.date === matchdayDate)
    .map(toUpcomingMatch)
    .filter((match) => match.kickoffUtc.getTime() >= nowMs - LIVE_WINDOW_MS)
    .sort((a, b) => a.kickoffUtc.getTime() - b.kickoffUtc.getTime());
}

export function getUpcomingMatchday(
  matches: NormalizedMatch[],
  now: Date = new Date(),
): UpcomingMatchday | null {
  const scheduled = matches.filter(isScheduled);
  if (scheduled.length === 0) return null;

  const usToday = getUsTournamentDate(now);
  const nowMs = now.getTime();
  const dates = [...new Set(scheduled.map((match) => match.date))].sort();
  const startIndex = dates.findIndex((date) => date >= usToday);
  if (startIndex === -1) return null;

  for (let index = startIndex; index < dates.length; index += 1) {
    const matchdayDate = dates[index];
    const dayMatches = upcomingOnMatchday(scheduled, matchdayDate, nowMs);
    if (dayMatches.length > 0) {
      return {
        matchdayDate,
        matchdayLabel: formatMatchdayLabel(matchdayDate),
        matches: dayMatches,
      };
    }
  }

  return null;
}
