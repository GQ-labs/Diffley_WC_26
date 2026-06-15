import type { MatchOutcome, NormalizedMatch } from './types/match';

export function getMatchOutcome(
  team: string,
  match: Pick<
    NormalizedMatch,
    'team1' | 'team2' | 'homeScore' | 'awayScore' | 'decidedByPenalties'
  >,
): MatchOutcome | null {
  const { homeScore, awayScore } = match;
  if (homeScore === null || awayScore === null) return null;

  const isHome = match.team1 === team;
  const isAway = match.team2 === team;
  if (!isHome && !isAway) return null;

  if (match.decidedByPenalties && homeScore === awayScore) {
    return 'draw';
  }

  if (homeScore === awayScore) return 'draw';

  const teamWon = isHome ? homeScore > awayScore : awayScore > homeScore;
  return teamWon ? 'win' : 'loss';
}
