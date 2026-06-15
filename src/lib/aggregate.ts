import type { DraftConfig, ScoringConfig } from '../types/config';
import { buildOwnerMap } from './draftUtils';
import { buildTeamStanding } from './scoring';
import type { NormalizedMatch, PlayerStanding, TeamStanding } from './types/match';

export type RankedPlayerStanding = PlayerStanding & { rank: number };

export interface RankedTeamStanding extends TeamStanding {
  rank: number;
  owner: string;
}

export function buildTeamStandings(
  teams: string[],
  matches: NormalizedMatch[],
  scoring: ScoringConfig,
): TeamStanding[] {
  return teams
    .map((team) => buildTeamStanding(team, matches, scoring))
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.matchPoints !== a.matchPoints) return b.matchPoints - a.matchPoints;
      return a.team.localeCompare(b.team);
    });
}

export function buildPlayerStandings(
  draft: DraftConfig,
  matches: NormalizedMatch[],
  scoring: ScoringConfig,
): RankedPlayerStanding[] {
  return draft.players
    .map((player) => {
      const teamStandings = player.teams.map((team) =>
        buildTeamStanding(team, matches, scoring),
      );

      const matchPoints = teamStandings.reduce((sum, t) => sum + t.matchPoints, 0);
      const milestonePoints = teamStandings.reduce(
        (sum, t) => sum + t.milestonePoints,
        0,
      );
      const wins = teamStandings.reduce((sum, t) => sum + t.wins, 0);
      const draws = teamStandings.reduce((sum, t) => sum + t.draws, 0);
      const losses = teamStandings.reduce((sum, t) => sum + t.losses, 0);

      return {
        id: player.id,
        name: player.name,
        teams: player.teams,
        matchPoints,
        milestonePoints,
        totalPoints: matchPoints + milestonePoints,
        wins,
        draws,
        losses,
        teamStandings,
      };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.matchPoints !== a.matchPoints) return b.matchPoints - a.matchPoints;
      return a.name.localeCompare(b.name);
    })
    .map((standing, index) => ({ ...standing, rank: index + 1 }));
}

export function buildRankedTeamStandings(
  draft: DraftConfig,
  matches: NormalizedMatch[],
  scoring: ScoringConfig,
): RankedTeamStanding[] {
  const teams = getAllTeamsFromDraft(draft);
  const ownerMap = buildOwnerMap(draft);

  return buildTeamStandings(teams, matches, scoring).map((standing, index) => ({
    ...standing,
    rank: index + 1,
    owner: ownerMap.get(standing.team) ?? '—',
  }));
}

export function getAllTeamsFromDraft(draft: DraftConfig): string[] {
  return [...new Set(draft.players.flatMap((p) => p.teams))].sort();
}
