import annexData from '../../data/third-place-annex-c.json';
import type { GroupTable } from './groups';
import { rankThirdPlaceTeams } from './groups';

/** Group winners with a fixed third-place opponent slot (FIFA Annex C columns). */
const ANNEX_C_WINNERS = annexData.winners as string[];

/** R32 match numbers that take a third-placed team, keyed by winner group letter. */
const THIRD_SLOT_BY_WINNER_GROUP: Record<string, number> = {
  A: 79,
  B: 85,
  D: 81,
  E: 74,
  G: 82,
  I: 77,
  K: 87,
  L: 80,
};

const thirdPlaceByWinnerGroup = buildThirdPlaceLookup();

function buildThirdPlaceLookup(): Map<string, Record<string, string>> {
  const lookup = new Map<string, Record<string, string>>();

  for (const row of annexData.rows as string[]) {
    const byWinner: Record<string, string> = {};
    for (let index = 0; index < ANNEX_C_WINNERS.length; index++) {
      byWinner[ANNEX_C_WINNERS[index]] = row[index];
    }
    const combo = row.split('').sort().join('');
    lookup.set(combo, byWinner);
  }

  return lookup;
}

function thirdPlaceTeamForGroup(tables: GroupTable[], letter: string): string | null {
  const table = tables.find((entry) => entry.letter === letter);
  return table?.rows[2]?.team ?? null;
}

/**
 * Assign third-placed teams to R32 slots using FIFA Annex C once eight qualifiers
 * are known from the current group tables.
 */
export function assignThirdPlaceTeams(tables: GroupTable[]): Map<number, string> {
  const thirdRankings = rankThirdPlaceTeams(tables);
  const advancing = thirdRankings.filter((entry) => entry.advances);

  if (advancing.length < 8) {
    return assignPartialThirdPlaceTeams(thirdRankings, advancing);
  }

  const combo = advancing
    .map((entry) => entry.letter)
    .sort()
    .join('');
  const byWinner = thirdPlaceByWinnerGroup.get(combo);
  const byMatchNum = new Map<number, string>();

  if (!byWinner) return byMatchNum;

  for (const [winnerGroup, thirdGroup] of Object.entries(byWinner)) {
    const matchNum = THIRD_SLOT_BY_WINNER_GROUP[winnerGroup];
    const team = thirdPlaceTeamForGroup(tables, thirdGroup);
    if (matchNum && team) {
      byMatchNum.set(matchNum, team);
    }
  }

  return byMatchNum;
}

/** Fallback while fewer than eight third-place qualifiers are confirmed. */
function assignPartialThirdPlaceTeams(
  thirdRankings: ReturnType<typeof rankThirdPlaceTeams>,
  advancing: ReturnType<typeof rankThirdPlaceTeams>,
): Map<number, string> {
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

  const advancingLetters = new Set(advancing.map((entry) => entry.letter));
  const assignedLetters = new Set<string>();
  const byMatchNum = new Map<number, string>();

  for (const num of THIRD_PLACE_ASSIGNMENT_ORDER) {
    const eligible = THIRD_SLOT_ELIGIBILITY[num].slice(1).split('/');
    const pick = thirdRankings.find(
      (entry) =>
        eligible.includes(entry.letter) &&
        advancingLetters.has(entry.letter) &&
        !assignedLetters.has(entry.letter),
    );
    if (pick) {
      byMatchNum.set(num, pick.team);
      assignedLetters.add(pick.letter);
    }
  }

  return byMatchNum;
}

export function annexRowCount(): number {
  return (annexData.rows as string[]).length;
}
