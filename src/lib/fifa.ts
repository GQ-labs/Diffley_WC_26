import fifaData from '../../data/fifa.json';
import { normalizeTeamName } from './teamNames';

const teams = fifaData.teams as Record<string, string>;
const matches = fifaData.matches as Record<string, string>;
const fixturesFallback = fifaData.meta.fixturesFallback;

export function matchLookupKey(
  date: string,
  team1: string,
  team2: string,
): string {
  const day = date.slice(0, 10);
  const pair = [normalizeTeamName(team1), normalizeTeamName(team2)].sort();
  return `${day}|${pair[0]}|${pair[1]}`;
}

export function getFifaTeamUrl(team: string): string | undefined {
  const canonical = normalizeTeamName(team);
  return teams[canonical];
}

export function getFifaMatchUrl(
  date: string,
  team1: string,
  team2: string,
): string | undefined {
  return matches[matchLookupKey(date, team1, team2)];
}

export function getFifaFixturesUrl(): string {
  return fixturesFallback;
}

export function openFifaUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
