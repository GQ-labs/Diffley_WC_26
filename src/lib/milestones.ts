import teamAliases from '../../data/team-aliases.json';
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
  return matches.some((m) => {
    if (m.knockoutRound !== round) return false;
    if (m.homeScore === null || m.awayScore === null) return false;
    if (m.team1 !== team && m.team2 !== team) return false;
    return getMatchOutcome(team, m) === 'win';
  });
}

/** R32 bonus: openfootball has assigned this team to a Round of 32 fixture. */
export function hasQualifiedForRoundOf32(
  team: string,
  matches: NormalizedMatch[],
): boolean {
  return isTeamSlottedInRound(team, 'roundOf32', matches);
}

export function hasReachedKnockoutStage(
  team: string,
  stage: KnockoutMilestoneKey,
  matches: NormalizedMatch[],
): boolean {
  switch (stage) {
    case 'roundOf16':
      return (
        wonKnockoutRound(team, 'roundOf32', matches) ||
        isTeamSlottedInRound(team, 'roundOf16', matches) ||
        playedInKnockoutRound(team, 'roundOf16', matches)
      );
    case 'quarterFinal':
      return (
        wonKnockoutRound(team, 'roundOf16', matches) ||
        isTeamSlottedInRound(team, 'quarterFinal', matches) ||
        playedInKnockoutRound(team, 'quarterFinal', matches)
      );
    case 'semiFinal':
      return (
        wonKnockoutRound(team, 'quarterFinal', matches) ||
        isTeamSlottedInRound(team, 'semiFinal', matches) ||
        playedInKnockoutRound(team, 'semiFinal', matches)
      );
    case 'final':
      return (
        wonKnockoutRound(team, 'semiFinal', matches) ||
        isTeamSlottedInRound(team, 'final', matches) ||
        playedInKnockoutRound(team, 'final', matches)
      );
    default:
      return false;
  }
}

/**
 * Milestone from openfootball fixture data only — no computed group tables.
 * Bonus applies when a team is slotted into a round or advances (wins) into the next.
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
