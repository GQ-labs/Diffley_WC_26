import teamAliases from '../../data/team-aliases.json';
import { getMatchOutcome } from './matchOutcome';
import type { NormalizedMatch } from './types/match';

const canonicalTeams = new Set(teamAliases.canonicalTeams as string[]);

export const GROUP_LETTERS = 'ABCDEFGHIJKL'.split('');

export type GroupQualificationStatus =
  | 'qualified'
  | 'possible'
  | 'eliminated'
  | 'third-live'
  | 'third-out'
  | 'pending';

export interface GroupTeamRow {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
  qualification: GroupQualificationStatus;
  projected: boolean;
}

export interface GroupTable {
  letter: string;
  label: string;
  complete: boolean;
  rows: GroupTeamRow[];
}

/** Pre-tournament FIFA ranking order for tiebreakers (lower = better). */
const FIFA_RANK: Record<string, number> = {
  Argentina: 1,
  France: 2,
  Spain: 3,
  England: 4,
  Brazil: 5,
  Portugal: 6,
  Netherlands: 7,
  Belgium: 8,
  Germany: 9,
  Croatia: 10,
  Morocco: 11,
  Colombia: 12,
  Uruguay: 13,
  USA: 14,
  Mexico: 15,
  Switzerland: 16,
  Japan: 17,
  Senegal: 18,
  Iran: 19,
  Korea: 20,
  Ecuador: 21,
  Austria: 22,
  Turkey: 23,
  Australia: 24,
  Canada: 25,
  Norway: 26,
  Panama: 27,
  Egypt: 28,
  Algeria: 29,
  Scotland: 30,
  Paraguay: 31,
  Tunisia: 32,
  'Ivory Coast': 33,
  Sweden: 34,
  Czechia: 35,
  Qatar: 36,
  Congo: 37,
  'Saudi Arabia': 38,
  Jordan: 39,
  Bosnia: 40,
  Ghana: 41,
  'Cape Verde': 42,
  Uzbekistan: 43,
  Curacao: 44,
  'New Zealand': 45,
  Haiti: 46,
  Iraq: 47,
  'South Africa': 48,
};

interface TeamStats {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

function groupLetterFromLabel(group?: string): string | null {
  if (!group) return null;
  const match = group.match(/Group\s+([A-L])/i);
  return match ? match[1].toUpperCase() : null;
}

function emptyStats(team: string): TeamStats {
  return {
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };
}

function collectGroupMatches(
  matches: NormalizedMatch[],
): Map<string, NormalizedMatch[]> {
  const byGroup = new Map<string, NormalizedMatch[]>();
  for (const letter of GROUP_LETTERS) {
    byGroup.set(letter, []);
  }

  for (const match of matches) {
    if (match.stage !== 'group') continue;
    const letter = groupLetterFromLabel(match.group);
    if (!letter) continue;
    byGroup.get(letter)?.push(match);
  }

  return byGroup;
}

function applyResult(stats: Map<string, TeamStats>, match: NormalizedMatch): void {
  if (match.homeScore === null || match.awayScore === null) return;

  const home = stats.get(match.team1) ?? emptyStats(match.team1);
  const away = stats.get(match.team2) ?? emptyStats(match.team2);

  home.played += 1;
  away.played += 1;
  home.goalsFor += match.homeScore;
  home.goalsAgainst += match.awayScore;
  away.goalsFor += match.awayScore;
  away.goalsAgainst += match.homeScore;

  const homeOutcome = getMatchOutcome(match.team1, match);
  if (homeOutcome === 'win') {
    home.wins += 1;
    home.points += 3;
    away.losses += 1;
  } else if (homeOutcome === 'draw') {
    home.draws += 1;
    away.draws += 1;
    home.points += 1;
    away.points += 1;
  } else {
    home.losses += 1;
    away.wins += 1;
    away.points += 3;
  }

  stats.set(match.team1, home);
  stats.set(match.team2, away);
}

function statsBetween(
  teams: string[],
  matches: NormalizedMatch[],
): Map<string, TeamStats> {
  const subset = new Map<string, TeamStats>();
  for (const team of teams) {
    subset.set(team, emptyStats(team));
  }

  for (const match of matches) {
    if (match.homeScore === null || match.awayScore === null) continue;
    if (!teams.includes(match.team1) || !teams.includes(match.team2)) continue;
    applyResult(subset, match);
  }

  return subset;
}

function compareTeams(
  a: TeamStats,
  b: TeamStats,
  mini: Map<string, TeamStats>,
): number {
  if (b.points !== a.points) return b.points - a.points;
  const miniA = mini.get(a.team)!;
  const miniB = mini.get(b.team)!;
  if (miniB.points !== miniA.points) return miniB.points - miniA.points;
  const gdA = miniA.goalsFor - miniA.goalsAgainst;
  const gdB = miniB.goalsFor - miniB.goalsAgainst;
  if (gdB !== gdA) return gdB - gdA;
  if (miniB.goalsFor !== miniA.goalsFor) return miniB.goalsFor - miniA.goalsFor;
  const fullGdA = a.goalsFor - a.goalsAgainst;
  const fullGdB = b.goalsFor - b.goalsAgainst;
  if (fullGdB !== fullGdA) return fullGdB - fullGdA;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  const rankA = FIFA_RANK[a.team] ?? 999;
  const rankB = FIFA_RANK[b.team] ?? 999;
  if (rankA !== rankB) return rankA - rankB;
  return a.team.localeCompare(b.team);
}

function rankGroupTeams(
  stats: Map<string, TeamStats>,
  matches: NormalizedMatch[],
): TeamStats[] {
  const teams = [...stats.values()];

  const sortGroup = (groupTeams: string[]): TeamStats[] => {
    if (groupTeams.length <= 1) {
      return groupTeams.map((team) => stats.get(team)!);
    }
    const mini = statsBetween(groupTeams, matches);
    return [...groupTeams]
      .map((team) => stats.get(team)!)
      .sort((a, b) => compareTeams(a, b, mini));
  };

  const pointGroups = [...new Set(teams.map((team) => team.points))].sort(
    (a, b) => b - a,
  );

  const ranked: TeamStats[] = [];
  for (const points of pointGroups) {
    const groupTeams = teams
      .filter((team) => team.points === points)
      .map((team) => team.team);
    ranked.push(...sortGroup(groupTeams));
  }

  return ranked;
}

function isGroupComplete(groupMatches: NormalizedMatch[]): boolean {
  if (groupMatches.length === 0) return false;
  return groupMatches.every(
    (match) => match.homeScore !== null && match.awayScore !== null,
  );
}

export const GROUP_MATCHES_PER_GROUP = 6;

export function allGroupMatchesComplete(matches: NormalizedMatch[]): boolean {
  for (const letter of GROUP_LETTERS) {
    const groupMatches = matches.filter(
      (match) =>
        match.stage === 'group' && groupLetterFromLabel(match.group) === letter,
    );
    if (groupMatches.length !== GROUP_MATCHES_PER_GROUP) return false;
    if (
      !groupMatches.every(
        (match) => match.homeScore !== null && match.awayScore !== null,
      )
    ) {
      return false;
    }
  }
  return true;
}

function applyQualification(
  table: GroupTable,
  thirdRankings: ThirdPlaceRanking[],
): GroupTable {
  const rows = table.rows.map((row) => {
    let qualification: GroupQualificationStatus = 'pending';

    if (table.complete) {
      if (row.position <= 2) qualification = 'qualified';
      else if (row.position === 3) {
        const thirdRank = thirdRankings.findIndex(
          (entry) => entry.letter === table.letter,
        );
        qualification = thirdRank >= 0 && thirdRank < 8 ? 'third-live' : 'third-out';
      } else {
        qualification = 'eliminated';
      }
    } else if (row.position <= 2) {
      qualification = 'possible';
    } else if (row.position === 3) {
      const thirdRank = thirdRankings.findIndex(
        (entry) => entry.letter === table.letter,
      );
      qualification = thirdRank >= 0 && thirdRank < 8 ? 'third-live' : 'possible';
    } else {
      qualification = 'possible';
    }

    return { ...row, qualification, projected: !table.complete };
  });

  return { ...table, rows };
}

export function buildGroupTable(
  letter: string,
  matches: NormalizedMatch[],
): GroupTable {
  const snapshot = buildGroupTableSnapshot(letter, matches);
  const snapshots = GROUP_LETTERS.map((groupLetter) =>
    groupLetter === letter
      ? snapshot
      : buildGroupTableSnapshot(groupLetter, matches),
  );
  return applyQualification(snapshot, rankThirdPlaceTeams(snapshots));
}

export function buildAllGroupTables(matches: NormalizedMatch[]): GroupTable[] {
  const snapshots = GROUP_LETTERS.map((letter) =>
    buildGroupTableSnapshot(letter, matches),
  );
  const thirdRankings = rankThirdPlaceTeams(snapshots);
  return snapshots.map((table) => applyQualification(table, thirdRankings));
}

function buildGroupTableSnapshot(
  letter: string,
  matches: NormalizedMatch[],
): GroupTable {
  const groupMatches = collectGroupMatches(matches).get(letter) ?? [];
  const stats = new Map<string, TeamStats>();

  for (const match of groupMatches) {
    if (!stats.has(match.team1)) stats.set(match.team1, emptyStats(match.team1));
    if (!stats.has(match.team2)) stats.set(match.team2, emptyStats(match.team2));
    applyResult(stats, match);
  }

  const ranked = rankGroupTeams(stats, groupMatches);
  return {
    letter,
    label: `Group ${letter}`,
    complete: isGroupComplete(groupMatches),
    rows: ranked.map((team, index) => ({
      team: team.team,
      played: team.played,
      wins: team.wins,
      draws: team.draws,
      losses: team.losses,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalsFor - team.goalsAgainst,
      points: team.points,
      position: index + 1,
      qualification: 'pending',
      projected: !isGroupComplete(groupMatches),
    })),
  };
}

export interface ThirdPlaceRanking {
  letter: string;
  team: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
  rank: number;
  advances: boolean;
}

export function rankThirdPlaceTeams(tables: GroupTable[]): ThirdPlaceRanking[] {
  const thirds = tables
    .map((table) => {
      const third = table.rows[2];
      if (!third) return null;
      return {
        letter: table.letter,
        team: third.team,
        points: third.points,
        goalDifference: third.goalDifference,
        goalsFor: third.goalsFor,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const sorted = [...thirds].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    const rankA = FIFA_RANK[a.team] ?? 999;
    const rankB = FIFA_RANK[b.team] ?? 999;
    if (rankA !== rankB) return rankA - rankB;
    return a.letter.localeCompare(b.letter);
  });

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    advances: index < 8,
  }));
}


export function isCanonicalTeamName(name: string): boolean {
  return canonicalTeams.has(name);
}

export function isBracketPlaceholder(name: string): boolean {
  if (isCanonicalTeamName(name)) return false;
  return (
    /^[12][A-L]$/.test(name) ||
    /^3(?:[A-L](?:\/[A-L])*)$/.test(name) ||
    /^[WL]\d+$/.test(name)
  );
}
