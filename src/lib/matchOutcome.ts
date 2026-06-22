import type { MatchOutcome, NormalizedMatch } from './types/match';

export function getMatchWinner(
  match: Pick<
    NormalizedMatch,
    | 'team1'
    | 'team2'
    | 'homeScore'
    | 'awayScore'
    | 'decidedByPenalties'
    | 'penHomeScore'
    | 'penAwayScore'
  >,
): string | null {
  const { homeScore, awayScore } = match;
  if (homeScore === null || awayScore === null) return null;

  if (homeScore > awayScore) return match.team1;
  if (awayScore > homeScore) return match.team2;

  if (
    match.decidedByPenalties &&
    match.penHomeScore !== null &&
    match.penHomeScore !== undefined &&
    match.penAwayScore !== null &&
    match.penAwayScore !== undefined
  ) {
    if (match.penHomeScore > match.penAwayScore) return match.team1;
    if (match.penAwayScore > match.penHomeScore) return match.team2;
  }

  return null;
}

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
