import type { NormalizedMatch } from './types/match';

export interface FixtureRow {
  id: string;
  date: string;
  round: string;
  team1: string;
  team2: string;
  score: string;
  status: 'final' | 'scheduled';
  sortKey: string;
}

function formatRound(match: NormalizedMatch): string {
  if (match.group) return match.group;
  if (match.stage === 'group') return 'Group stage';
  return match.roundLabel;
}

function formatScore(match: NormalizedMatch): string {
  if (match.homeScore === null || match.awayScore === null) {
    return '—';
  }
  return `${match.homeScore} – ${match.awayScore}`;
}

export function buildFixtureRows(matches: NormalizedMatch[]): FixtureRow[] {
  return matches
    .map((match) => ({
      id: match.id,
      date: match.date,
      round: formatRound(match),
      team1: match.team1,
      team2: match.team2,
      score: formatScore(match),
      status:
        match.homeScore !== null && match.awayScore !== null
          ? ('final' as const)
          : ('scheduled' as const),
      sortKey: `${match.date}|${match.id}`,
    }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function countFinalFixtures(fixtures: FixtureRow[]): number {
  return fixtures.filter((f) => f.status === 'final').length;
}
