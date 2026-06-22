import { getMatchWinner } from './matchOutcome';
import {
  allGroupMatchesComplete,
  buildAllGroupTables,
  isCanonicalTeamName,
  rankThirdPlaceTeams,
  type GroupTable,
} from './groups';
import type { KnockoutMilestoneKey, NormalizedMatch } from './types/match';

export interface BracketMatch {
  num: number;
  round: KnockoutMilestoneKey | 'thirdPlace';
  roundLabel: string;
  team1: string;
  team2: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  winner: string | null;
  projected: boolean;
  matchId: string;
}

export interface BracketTree {
  roundOf32: BracketMatch[];
  roundOf16: BracketMatch[];
  quarterFinals: BracketMatch[];
  semiFinals: BracketMatch[];
  thirdPlace: BracketMatch | null;
  final: BracketMatch | null;
  groupStageComplete: boolean;
  r32ResolvedOnServer: boolean;
  projected: boolean;
}

export interface BuildBracketTreeOptions {
  /** When true, project winners through unplayed knockout ties for display. */
  projectFutureRounds?: boolean;
}

const R32_TEMPLATES: Array<{ num: number; team1: string; team2: string }> = [
  { num: 73, team1: '2A', team2: '2B' },
  { num: 74, team1: '1E', team2: '3A/B/C/D/F' },
  { num: 75, team1: '1F', team2: '2C' },
  { num: 76, team1: '1C', team2: '2F' },
  { num: 77, team1: '1I', team2: '3C/D/F/G/H' },
  { num: 78, team1: '2E', team2: '2I' },
  { num: 79, team1: '1A', team2: '3C/E/F/H/I' },
  { num: 80, team1: '1L', team2: '3E/H/I/J/K' },
  { num: 81, team1: '1D', team2: '3B/E/F/I/J' },
  { num: 82, team1: '1G', team2: '3A/E/H/I/J' },
  { num: 83, team1: '2K', team2: '2L' },
  { num: 84, team1: '1H', team2: '2J' },
  { num: 85, team1: '1B', team2: '3E/F/G/I/J' },
  { num: 86, team1: '1J', team2: '2H' },
  { num: 87, team1: '1K', team2: '3D/E/I/J/L' },
  { num: 88, team1: '2D', team2: '2G' },
];

const THIRD_PLACE_ASSIGNMENT_ORDER = [74, 77, 79, 80, 81, 82, 85, 87] as const;

const THIRD_SLOT_ELIGIBILITY: Record<number, string> = {
  74: '3A/B/C/D/F',
  77: '3C/D/F/G/H',
  79: '3C/E/F/H/I',
  80: '3E/H/I/J/K',
  81: '3B/E/F/I/J',
  82: '3A/E/H/I/J',
  85: '3E/F/G/I/J',
  87: '3D/E/I/J/L',
};

const LATER_ROUNDS: Array<{
  num: number;
  round: KnockoutMilestoneKey | 'thirdPlace';
  roundLabel: string;
  team1: string;
  team2: string;
}> = [
  { num: 89, round: 'roundOf16', roundLabel: 'Round of 16', team1: 'W74', team2: 'W77' },
  { num: 90, round: 'roundOf16', roundLabel: 'Round of 16', team1: 'W73', team2: 'W75' },
  { num: 91, round: 'roundOf16', roundLabel: 'Round of 16', team1: 'W76', team2: 'W78' },
  { num: 92, round: 'roundOf16', roundLabel: 'Round of 16', team1: 'W79', team2: 'W80' },
  { num: 93, round: 'roundOf16', roundLabel: 'Round of 16', team1: 'W83', team2: 'W84' },
  { num: 94, round: 'roundOf16', roundLabel: 'Round of 16', team1: 'W81', team2: 'W82' },
  { num: 95, round: 'roundOf16', roundLabel: 'Round of 16', team1: 'W86', team2: 'W88' },
  { num: 96, round: 'roundOf16', roundLabel: 'Round of 16', team1: 'W85', team2: 'W87' },
  { num: 97, round: 'quarterFinal', roundLabel: 'Quarter-final', team1: 'W89', team2: 'W90' },
  { num: 98, round: 'quarterFinal', roundLabel: 'Quarter-final', team1: 'W93', team2: 'W94' },
  { num: 99, round: 'quarterFinal', roundLabel: 'Quarter-final', team1: 'W91', team2: 'W92' },
  { num: 100, round: 'quarterFinal', roundLabel: 'Quarter-final', team1: 'W95', team2: 'W96' },
  { num: 101, round: 'semiFinal', roundLabel: 'Semi-final', team1: 'W97', team2: 'W98' },
  { num: 102, round: 'semiFinal', roundLabel: 'Semi-final', team1: 'W99', team2: 'W100' },
  { num: 103, round: 'thirdPlace', roundLabel: 'Match for third place', team1: 'L101', team2: 'L102' },
  { num: 104, round: 'final', roundLabel: 'Final', team1: 'W101', team2: 'W102' },
];

function matchNumFromId(id: string): number | null {
  const match = id.match(/^m(\d+)$/);
  return match ? Number(match[1]) : null;
}

function matchesByNum(matches: NormalizedMatch[]): Map<number, NormalizedMatch> {
  const map = new Map<number, NormalizedMatch>();
  for (const match of matches) {
    const num = matchNumFromId(match.id);
    if (num) map.set(num, match);
  }
  return map;
}

function parseThirdEligibleGroups(placeholder: string): string[] {
  if (!placeholder.startsWith('3')) return [];
  return placeholder.slice(1).split('/');
}

function assignThirdPlaceTeams(tables: GroupTable[]) {
  const thirdRankings = rankThirdPlaceTeams(tables);
  const advancing = new Set(
    thirdRankings.filter((entry) => entry.advances).map((entry) => entry.letter),
  );
  const assignedLetters = new Set<string>();
  const byMatchNum = new Map<number, string>();

  for (const num of THIRD_PLACE_ASSIGNMENT_ORDER) {
    const eligible = parseThirdEligibleGroups(THIRD_SLOT_ELIGIBILITY[num]);
    const pick = thirdRankings.find(
      (entry) =>
        eligible.includes(entry.letter) &&
        advancing.has(entry.letter) &&
        !assignedLetters.has(entry.letter),
    );
    if (pick) {
      byMatchNum.set(num, pick.team);
      assignedLetters.add(pick.letter);
    }
  }

  return byMatchNum;
}

function teamAtGroupRank(
  tables: GroupTable[],
  rank: 1 | 2,
  letter: string,
): string | null {
  const table = tables.find((entry) => entry.letter === letter);
  const row = table?.rows[rank - 1];
  return row?.team ?? null;
}

function resolveSeedSlot(
  slot: string,
  tables: GroupTable[],
  thirdByMatchNum: Map<number, string>,
  matchNum: number,
): { team: string; projected: boolean } {
  if (isCanonicalTeamName(slot)) {
    return { team: slot, projected: false };
  }

  const positionMatch = slot.match(/^([12])([A-L])$/);
  if (positionMatch) {
    const rank = Number(positionMatch[1]) as 1 | 2;
    const letter = positionMatch[2];
    const team = teamAtGroupRank(tables, rank, letter);
    const table = tables.find((entry) => entry.letter === letter);
    return { team: team ?? 'TBD', projected: !table?.complete };
  }

  if (slot.startsWith('3')) {
    const team = thirdByMatchNum.get(matchNum);
    const allComplete = tables.every((table) => table.complete);
    return { team: team ?? 'TBD', projected: !allComplete };
  }

  return { team: 'TBD', projected: true };
}

interface FeedResolution {
  team: string;
  projected: boolean;
}

function resolveFeedSlot(
  slot: string,
  winners: Map<number, string>,
  losers: Map<number, string>,
  projectedWinners: Map<number, string>,
  projectedLosers: Map<number, string>,
): FeedResolution {
  const winnerMatch = slot.match(/^W(\d+)$/);
  if (winnerMatch) {
    const num = Number(winnerMatch[1]);
    if (winners.has(num)) {
      return { team: winners.get(num)!, projected: false };
    }
    if (projectedWinners.has(num)) {
      return { team: projectedWinners.get(num)!, projected: true };
    }
    return { team: 'TBD', projected: true };
  }
  const loserMatch = slot.match(/^L(\d+)$/);
  if (loserMatch) {
    const num = Number(loserMatch[1]);
    if (losers.has(num)) {
      return { team: losers.get(num)!, projected: false };
    }
    if (projectedLosers.has(num)) {
      return { team: projectedLosers.get(num)!, projected: true };
    }
    return { team: 'TBD', projected: true };
  }
  return { team: slot, projected: !isCanonicalTeamName(slot) };
}

function groupRowFor(team: string, tables: GroupTable[]) {
  for (const table of tables) {
    const row = table.rows.find((entry) => entry.team === team);
    if (row) return row;
  }
  return null;
}

function preferredWinner(
  team1: string,
  team2: string,
  tables: GroupTable[],
): string | null {
  if (!isCanonicalTeamName(team1) || !isCanonicalTeamName(team2)) return null;

  const a = groupRowFor(team1, tables);
  const b = groupRowFor(team2, tables);
  if (!a || !b) return team1;

  if (b.points !== a.points) return b.points > a.points ? b.team : a.team;
  if (b.goalDifference !== a.goalDifference) {
    return b.goalDifference > a.goalDifference ? b.team : a.team;
  }
  if (b.goalsFor !== a.goalsFor) {
    return b.goalsFor > a.goalsFor ? b.team : a.team;
  }
  return team1;
}

function recordProjectedOutcomes(
  match: BracketMatch,
  tables: GroupTable[],
  projectedWinners: Map<number, string>,
  projectedLosers: Map<number, string>,
): void {
  if (match.winner) return;

  const projected = preferredWinner(match.team1, match.team2, tables);
  if (!projected) return;

  projectedWinners.set(match.num, projected);
  const loser = match.team1 === projected ? match.team2 : match.team1;
  if (isCanonicalTeamName(loser)) {
    projectedLosers.set(match.num, loser);
  }
}

function mergeServerTeams(
  computedTeam: string,
  serverTeam: string,
  projected: boolean,
): { team: string; projected: boolean } {
  if (isCanonicalTeamName(serverTeam)) {
    return { team: serverTeam, projected: false };
  }
  return { team: computedTeam, projected };
}

function buildResolvedMatch(
  template: {
    num: number;
    round: KnockoutMilestoneKey | 'thirdPlace';
    roundLabel: string;
    team1: string;
    team2: string;
  },
  tables: GroupTable[],
  thirdByMatchNum: Map<number, string>,
  byNum: Map<number, NormalizedMatch>,
  winners: Map<number, string>,
  losers: Map<number, string>,
  projectedWinners: Map<number, string>,
  projectedLosers: Map<number, string>,
): BracketMatch {
  const server = byNum.get(template.num);
  const resolveTeam1 =
    template.team1.startsWith('W') || template.team1.startsWith('L')
      ? resolveFeedSlot(
          template.team1,
          winners,
          losers,
          projectedWinners,
          projectedLosers,
        )
      : resolveSeedSlot(template.team1, tables, thirdByMatchNum, template.num);
  const resolveTeam2 =
    template.team2.startsWith('W') || template.team2.startsWith('L')
      ? resolveFeedSlot(
          template.team2,
          winners,
          losers,
          projectedWinners,
          projectedLosers,
        )
      : resolveSeedSlot(template.team2, tables, thirdByMatchNum, template.num);

  const team1 = server
    ? mergeServerTeams(resolveTeam1.team, server.team1, resolveTeam1.projected)
    : resolveTeam1;
  const team2 = server
    ? mergeServerTeams(resolveTeam2.team, server.team2, resolveTeam2.projected)
    : resolveTeam2;

  const winner = server ? getMatchWinner(server) : null;

  return {
    num: template.num,
    round: template.round,
    roundLabel: template.roundLabel,
    team1: team1.team,
    team2: team2.team,
    homeScore: server?.homeScore ?? null,
    awayScore: server?.awayScore ?? null,
    date: server?.date ?? '',
    winner,
    projected: team1.projected || team2.projected,
    matchId: server?.id ?? `m${template.num}`,
  };
}

export function r32DataAvailableFromServer(matches: NormalizedMatch[]): boolean {
  if (!allGroupMatchesComplete(matches)) return false;
  const byNum = matchesByNum(matches);
  return R32_TEMPLATES.every((template) => {
    const match = byNum.get(template.num);
    if (!match) return false;
    return (
      isCanonicalTeamName(match.team1) && isCanonicalTeamName(match.team2)
    );
  });
}

export function buildBracketTree(
  matches: NormalizedMatch[],
  options: BuildBracketTreeOptions = {},
): BracketTree {
  const projectFutureRounds = options.projectFutureRounds ?? false;
  const tables = buildAllGroupTables(matches);
  const thirdByMatchNum = assignThirdPlaceTeams(tables);
  const byNum = matchesByNum(matches);
  const winners = new Map<number, string>();
  const losers = new Map<number, string>();
  const projectedWinners = new Map<number, string>();
  const projectedLosers = new Map<number, string>();

  const roundOf32 = R32_TEMPLATES.map((template) =>
    buildResolvedMatch(
      {
        ...template,
        round: 'roundOf32',
        roundLabel: 'Round of 32',
      },
      tables,
      thirdByMatchNum,
      byNum,
      winners,
      losers,
      projectedWinners,
      projectedLosers,
    ),
  );

  for (const match of roundOf32) {
    if (match.winner) {
      winners.set(match.num, match.winner);
      const loser = match.team1 === match.winner ? match.team2 : match.team1;
      if (isCanonicalTeamName(loser)) losers.set(match.num, loser);
    } else if (projectFutureRounds) {
      recordProjectedOutcomes(
        match,
        tables,
        projectedWinners,
        projectedLosers,
      );
    }
  }

  const roundOf16 = LATER_ROUNDS.filter((match) => match.round === 'roundOf16').map(
    (template) =>
      buildResolvedMatch(
        template,
        tables,
        thirdByMatchNum,
        byNum,
        winners,
        losers,
        projectedWinners,
        projectedLosers,
      ),
  );

  for (const match of roundOf16) {
    if (match.winner) {
      winners.set(match.num, match.winner);
      const loser = match.team1 === match.winner ? match.team2 : match.team1;
      if (isCanonicalTeamName(loser)) losers.set(match.num, loser);
    } else if (projectFutureRounds) {
      recordProjectedOutcomes(
        match,
        tables,
        projectedWinners,
        projectedLosers,
      );
    }
  }

  const quarterFinals = LATER_ROUNDS.filter(
    (match) => match.round === 'quarterFinal',
  ).map((template) =>
    buildResolvedMatch(
      template,
      tables,
      thirdByMatchNum,
      byNum,
      winners,
      losers,
      projectedWinners,
      projectedLosers,
    ),
  );

  for (const match of quarterFinals) {
    if (match.winner) {
      winners.set(match.num, match.winner);
      const loser = match.team1 === match.winner ? match.team2 : match.team1;
      if (isCanonicalTeamName(loser)) losers.set(match.num, loser);
    } else if (projectFutureRounds) {
      recordProjectedOutcomes(
        match,
        tables,
        projectedWinners,
        projectedLosers,
      );
    }
  }

  const semiFinals = LATER_ROUNDS.filter((match) => match.round === 'semiFinal').map(
    (template) =>
      buildResolvedMatch(
        template,
        tables,
        thirdByMatchNum,
        byNum,
        winners,
        losers,
        projectedWinners,
        projectedLosers,
      ),
  );

  for (const match of semiFinals) {
    if (match.winner) {
      winners.set(match.num, match.winner);
      const loser = match.team1 === match.winner ? match.team2 : match.team1;
      if (isCanonicalTeamName(loser)) losers.set(match.num, loser);
    } else if (projectFutureRounds) {
      recordProjectedOutcomes(
        match,
        tables,
        projectedWinners,
        projectedLosers,
      );
    }
  }

  const thirdTemplate = LATER_ROUNDS.find((match) => match.round === 'thirdPlace');
  const finalTemplate = LATER_ROUNDS.find((match) => match.round === 'final');

  const thirdPlace = thirdTemplate
    ? buildResolvedMatch(
        thirdTemplate,
        tables,
        thirdByMatchNum,
        byNum,
        winners,
        losers,
        projectedWinners,
        projectedLosers,
      )
    : null;
  const final = finalTemplate
    ? buildResolvedMatch(
        finalTemplate,
        tables,
        thirdByMatchNum,
        byNum,
        winners,
        losers,
        projectedWinners,
        projectedLosers,
      )
    : null;

  const groupStageComplete = allGroupMatchesComplete(matches);
  const r32ResolvedOnServer = r32DataAvailableFromServer(matches);
  const projected =
    !groupStageComplete ||
    !r32ResolvedOnServer ||
    roundOf32.some((match) => match.projected);

  return {
    roundOf32,
    roundOf16,
    quarterFinals,
    semiFinals,
    thirdPlace,
    final,
    groupStageComplete,
    r32ResolvedOnServer,
    projected,
  };
}

export function teamInBracketRound(
  tree: BracketTree,
  team: string,
  round: KnockoutMilestoneKey,
): boolean {
  const pool =
    round === 'roundOf32'
      ? tree.roundOf32
      : round === 'roundOf16'
        ? tree.roundOf16
        : round === 'quarterFinal'
          ? tree.quarterFinals
          : round === 'semiFinal'
            ? tree.semiFinals
            : round === 'final'
              ? tree.final
                ? [tree.final]
                : []
              : [];

  return pool.some((match) => match.team1 === team || match.team2 === team);
}

export function teamWonBracketRound(
  tree: BracketTree,
  team: string,
  round: KnockoutMilestoneKey,
): boolean {
  const pool =
    round === 'roundOf32'
      ? tree.roundOf32
      : round === 'roundOf16'
        ? tree.roundOf16
        : round === 'quarterFinal'
          ? tree.quarterFinals
          : round === 'semiFinal'
            ? tree.semiFinals
            : round === 'final' && tree.final
              ? [tree.final]
              : [];

  return pool.some(
    (match) =>
      match.winner === team &&
      (round !== 'final' || match.round === 'final'),
  );
}

export function advancingThirdLetters(tables: GroupTable[]): string[] {
  return rankThirdPlaceTeams(tables)
    .filter((entry) => entry.advances)
    .map((entry) => entry.letter);
}

/** FIFA bracket feeder slots for knockout matches after the round of 32. */
export function getBracketFeederTemplate(
  matchNum: number,
): { team1: string; team2: string } | null {
  const template = LATER_ROUNDS.find((match) => match.num === matchNum);
  if (!template) return null;
  return { team1: template.team1, team2: template.team2 };
}

/** Turn W74 / L101 template slots into display labels (M74, Loser M101). */
export function formatFeederSlot(slot: string): string {
  const winner = slot.match(/^W(\d+)$/);
  if (winner) return `M${winner[1]}`;
  const loser = slot.match(/^L(\d+)$/);
  if (loser) return `Loser M${loser[1]}`;
  return slot;
}

/** True when a later-round match has a final score with real team names. */
export function bracketMatchHasResult(match: BracketMatch): boolean {
  return (
    match.homeScore !== null &&
    match.awayScore !== null &&
    isCanonicalTeamName(match.team1) &&
    isCanonicalTeamName(match.team2)
  );
}

/** Show M73-style feeder paths instead of projected countries. */
export function bracketMatchShowsFeederPaths(match: BracketMatch): boolean {
  if (match.round === 'roundOf32') return false;
  if (bracketMatchHasResult(match)) return false;
  return getBracketFeederTemplate(match.num) !== null;
}
