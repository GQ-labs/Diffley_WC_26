export interface Player {
  id: string;
  name: string;
  teams: string[];
}

export interface DraftConfig {
  meta: {
    title: string;
    season: number;
    source: string;
    updated: string;
  };
  players: Player[];
}

export interface ScoringConfig {
  match: {
    win: number;
    draw: number;
    loss: number;
    penaltyShootoutCountsAsDraw: boolean;
  };
  knockoutMilestone: {
    description: string;
    cumulative?: boolean;
    groupExit: number;
    roundOf32: number;
    roundOf16: number;
    quarterFinal: number;
    semiFinal: number;
    final: number;
    winner: number;
  };
  rulesText: Record<string, string>;
}

export type AppTab = 'leaderboard' | 'groups' | 'knockout' | 'fixtures' | 'rules';
