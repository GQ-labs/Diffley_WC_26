import type { ScoringConfig } from '../types/config';
import { classifyRound } from './rounds';
import { inferTeamMilestone, getCumulativeMilestonePoints } from './milestones';
import { getMatchOutcome } from './matchOutcome';
import type {
  MatchOutcome,
  NormalizedMatch,
  TeamMatchBreakdown,
  TeamStanding,
} from './types/match';

export { inferTeamMilestone, getCumulativeMilestonePoints } from './milestones';
export { getMatchOutcome } from './matchOutcome';

export function getMatchPoints(
  outcome: MatchOutcome,
  scoring: ScoringConfig,
): number {
  switch (outcome) {
    case 'win':
      return scoring.match.win;
    case 'draw':
      return scoring.match.draw;
    case 'loss':
      return scoring.match.loss;
  }
}

export function getMilestonePoints(
  key: import('./types/match').KnockoutMilestoneKey,
  scoring: ScoringConfig,
): number {
  return scoring.knockoutMilestone[key];
}

export function buildTeamStanding(
  team: string,
  matches: NormalizedMatch[],
  scoring: ScoringConfig,
): TeamStanding {
  const breakdown: TeamMatchBreakdown[] = [];
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let matchPoints = 0;

  const teamMatches = matches
    .filter((m) => m.team1 === team || m.team2 === team)
    .filter((m) => m.homeScore !== null && m.awayScore !== null);

  for (const match of teamMatches) {
    const outcome = getMatchOutcome(team, match);
    if (!outcome) continue;

    const points = getMatchPoints(outcome, scoring);
    matchPoints += points;

    if (outcome === 'win') wins += 1;
    else if (outcome === 'draw') draws += 1;
    else losses += 1;

    const isHome = match.team1 === team;
    const goalsFor = isHome ? match.homeScore! : match.awayScore!;
    const goalsAgainst = isHome ? match.awayScore! : match.homeScore!;

    breakdown.push({
      matchId: match.id,
      opponent: isHome ? match.team2 : match.team1,
      roundLabel: match.roundLabel,
      outcome,
      matchPoints: points,
      date: match.date,
      goalsFor,
      goalsAgainst,
    });
  }

  const milestoneKey = inferTeamMilestone(team, matches);
  const milestonePoints = getCumulativeMilestonePoints(
    team,
    matches,
    scoring.knockoutMilestone,
  );

  return {
    team,
    played: wins + draws + losses,
    wins,
    draws,
    losses,
    matchPoints,
    milestoneKey,
    milestonePoints,
    totalPoints: matchPoints + milestonePoints,
    breakdown,
  };
}

export function normalizeOpenFootballMatch(
  raw: {
    round?: string;
    date?: string;
    time?: string;
    team1?: string;
    team2?: string;
    group?: string;
    num?: number;
    score?: { ft?: number[]; pen?: number[] };
    penalty?: boolean;
  },
  index: number,
  normalizeTeam: (name: string) => string,
): NormalizedMatch | null {
  if (!raw.team1 || !raw.team2 || !raw.round) return null;

  const team1 = normalizeTeam(raw.team1);
  const team2 = normalizeTeam(raw.team2);
  const ft = raw.score?.ft;
  const homeScore = ft && ft.length >= 2 ? ft[0] : null;
  const awayScore = ft && ft.length >= 2 ? ft[1] : null;
  const { stage, knockoutRound } = classifyRound(raw.round, Boolean(raw.group));
  const pen = raw.score?.pen;
  const penHomeScore = pen && pen.length >= 2 ? pen[0] : null;
  const penAwayScore = pen && pen.length >= 2 ? pen[1] : null;
  const decidedByPenalties =
    Boolean(raw.penalty) ||
    (pen !== undefined && homeScore === awayScore);

  return {
    id: raw.num ? `m${raw.num}` : `g${index}`,
    team1,
    team2,
    homeScore,
    awayScore,
    roundLabel: raw.round,
    stage,
    knockoutRound,
    date: raw.date ?? '',
    kickoffTime: raw.time,
    decidedByPenalties,
    penHomeScore,
    penAwayScore,
    group: raw.group,
  };
}
