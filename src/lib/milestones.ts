import teamAliases from '../../data/team-aliases.json';
import type { ScoringConfig } from '../types/config';
import {
  buildBracketTree,
  r32DataAvailableFromServer,
  teamInBracketRound,
  teamWonBracketRound,
} from './bracket';
import { allGroupMatchesComplete, isCanonicalTeamName } from './groups';
import { getMatchOutcome } from './matchOutcome';
import type { KnockoutMilestoneKey, NormalizedMatch } from './types/match';

const canonicalTeams = new Set(teamAliases.canonicalTeams as string[]);

export function isCanonicalTeam(name: string): boolean {
  return canonicalTeams.has(name);
}

/**
 * Team is slotted into a knockout round when openfootball lists their real name
 * in that round's fixture (placeholders like "2A" or "W74" are ignored).
 */
export function isTeamSlottedInRound(
  team: string,
  round: KnockoutMilestoneKey,
  matches: NormalizedMatch[],
): boolean {
  if (!isCanonicalTeam(team)) return false;
  return matches.some(
    (m) =>
      m.knockoutRound === round &&
      (m.team1 === team || m.team2 === team),
  );
}

export function playedInKnockoutRound(
  team: string,
  round: KnockoutMilestoneKey,
  matches: NormalizedMatch[],
): boolean {
  return matches.some(
    (m) =>
      m.knockoutRound === round &&
      (m.team1 === team || m.team2 === team) &&
      m.homeScore !== null &&
      m.awayScore !== null,
  );
}

export function wonKnockoutRound(
  team: string,
  round: KnockoutMilestoneKey,
  matches: NormalizedMatch[],
): boolean {
  const tree = buildBracketTree(matches);
  return teamWonBracketRound(tree, team, round);
}

/** R32 bonus: group stage finished and server lists real teams in all R32 fixtures. */
export function hasQualifiedForRoundOf32(
  team: string,
  matches: NormalizedMatch[],
): boolean {
  if (!allGroupMatchesComplete(matches)) return false;
  if (!r32DataAvailableFromServer(matches)) return false;
  const tree = buildBracketTree(matches);
  return teamInBracketRound(tree, team, 'roundOf32');
}

export function hasReachedKnockoutStage(
  team: string,
  stage: KnockoutMilestoneKey,
  matches: NormalizedMatch[],
): boolean {
  const tree = buildBracketTree(matches);

  switch (stage) {
    case 'roundOf16':
      return (
        teamWonBracketRound(tree, team, 'roundOf32') ||
        teamInBracketRound(tree, team, 'roundOf16')
      );
    case 'quarterFinal':
      return (
        teamWonBracketRound(tree, team, 'roundOf16') ||
        teamInBracketRound(tree, team, 'quarterFinal')
      );
    case 'semiFinal':
      return (
        teamWonBracketRound(tree, team, 'quarterFinal') ||
        teamInBracketRound(tree, team, 'semiFinal')
      );
    case 'final':
      return (
        teamWonBracketRound(tree, team, 'semiFinal') ||
        (tree.final
          ? tree.final.team1 === team || tree.final.team2 === team
          : false)
      );
    default:
      return false;
  }
}

/**
 * Milestone from the tournament bracket tree.
 * R32 bonus waits until all group matches are done and openfootball lists real R32 teams.
 */
export function inferTeamMilestone(
  team: string,
  matches: NormalizedMatch[],
): KnockoutMilestoneKey {
  if (wonKnockoutRound(team, 'final', matches)) return 'winner';
  if (hasReachedKnockoutStage(team, 'final', matches)) return 'final';
  if (hasReachedKnockoutStage(team, 'semiFinal', matches)) return 'semiFinal';
  if (hasReachedKnockoutStage(team, 'quarterFinal', matches)) return 'quarterFinal';
  if (hasReachedKnockoutStage(team, 'roundOf16', matches)) return 'roundOf16';
  if (hasQualifiedForRoundOf32(team, matches)) return 'roundOf32';
  return 'groupExit';
}

/** Knockout rounds that pay +1 each when reached. */
export const KNOCKOUT_BONUS_STAGES = [
  'roundOf32',
  'roundOf16',
  'quarterFinal',
  'semiFinal',
  'final',
] as const;

export const KNOCKOUT_BONUS_STAGE_LABELS: Record<KnockoutBonusStage, string> = {
  roundOf32: 'Round of 32',
  roundOf16: 'Round of 16',
  quarterFinal: 'Quarter-final',
  semiFinal: 'Semi-final',
  final: 'Final',
};

export type KnockoutBonusStage = (typeof KNOCKOUT_BONUS_STAGES)[number];

export function hasReachedBonusStage(
  team: string,
  stage: KnockoutBonusStage,
  matches: NormalizedMatch[],
): boolean {
  switch (stage) {
    case 'roundOf32':
      return hasQualifiedForRoundOf32(team, matches);
    case 'roundOf16':
      return hasReachedKnockoutStage(team, 'roundOf16', matches);
    case 'quarterFinal':
      return hasReachedKnockoutStage(team, 'quarterFinal', matches);
    case 'semiFinal':
      return hasReachedKnockoutStage(team, 'semiFinal', matches);
    case 'final':
      return hasReachedKnockoutStage(team, 'final', matches);
  }
}

export function getCumulativeMilestonePoints(
  team: string,
  matches: NormalizedMatch[],
  bonuses: ScoringConfig['knockoutMilestone'],
): number {
  return KNOCKOUT_BONUS_STAGES.reduce((total, stage) => {
    if (!hasReachedBonusStage(team, stage, matches)) return total;
    return total + bonuses[stage];
  }, 0);
}

/** @deprecated kept for tests that assert openfootball slot detection */
export function isTeamListedInServerRound(
  team: string,
  round: KnockoutMilestoneKey,
  matches: NormalizedMatch[],
): boolean {
  return isTeamSlottedInRound(team, round, matches);
}

/** @deprecated kept for direct outcome checks in tests */
export function getKnockoutRoundOutcome(
  team: string,
  match: NormalizedMatch,
): ReturnType<typeof getMatchOutcome> {
  return getMatchOutcome(team, match);
}

export function isRealKnockoutTeamName(name: string): boolean {
  return isCanonicalTeamName(name);
}
