export type KnockoutMilestoneKey =
  | 'groupExit'
  | 'roundOf32'
  | 'roundOf16'
  | 'quarterFinal'
  | 'semiFinal'
  | 'final'
  | 'winner';

export type MatchOutcome = 'win' | 'draw' | 'loss';

export interface NormalizedMatch {
  id: string;
  team1: string;
  team2: string;
  homeScore: number | null;
  awayScore: number | null;
  roundLabel: string;
  stage: 'group' | 'knockout' | 'thirdPlace';
  knockoutRound: KnockoutMilestoneKey | null;
  date: string;
  kickoffTime?: string;
  decidedByPenalties: boolean;
  group?: string;
}

export interface TeamMatchBreakdown {
  matchId: string;
  opponent: string;
  roundLabel: string;
  outcome: MatchOutcome;
  matchPoints: number;
  date: string;
  goalsFor: number;
  goalsAgainst: number;
}

export interface TeamStanding {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  matchPoints: number;
  milestoneKey: KnockoutMilestoneKey;
  milestonePoints: number;
  totalPoints: number;
  breakdown: TeamMatchBreakdown[];
}

export interface PlayerStanding {
  id: string;
  name: string;
  teams: string[];
  matchPoints: number;
  milestonePoints: number;
  totalPoints: number;
  wins: number;
  draws: number;
  losses: number;
  teamStandings: TeamStanding[];
}
