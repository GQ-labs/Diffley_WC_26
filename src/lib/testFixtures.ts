import type { NormalizedMatch } from './types/match';

const GROUP_TEAMS: Record<string, [string, string, string, string]> = {
  A: ['Mexico', 'South Africa', 'Korea', 'Czechia'],
  B: ['Canada', 'Qatar', 'Switzerland', 'Bosnia'],
  C: ['Brazil', 'Haiti', 'Morocco', 'Scotland'],
  D: ['USA', 'Paraguay', 'Turkey', 'Australia'],
  E: ['Germany', 'Ecuador', 'Ivory Coast', 'Curacao'],
  F: ['Japan', 'Tunisia', 'Netherlands', 'Sweden'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Uruguay', 'Saudi Arabia', 'Cape Verde'],
  I: ['France', 'Senegal', 'Norway', 'Iraq'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Colombia', 'Congo', 'Uzbekistan'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
};

function roundRobinResults(
  group: string,
  teams: [string, string, string, string],
  idPrefix: string,
): NormalizedMatch[] {
  const pairings: Array<[number, number, number, number]> = [
    [0, 1, 1, 0],
    [2, 3, 1, 0],
    [1, 2, 1, 0],
    [0, 3, 1, 0],
    [0, 2, 1, 0],
    [1, 3, 1, 0],
  ];

  return pairings.map(([home, away, homeScore, awayScore], index) => ({
    id: `${idPrefix}${index + 1}`,
    team1: teams[home],
    team2: teams[away],
    homeScore,
    awayScore,
    roundLabel: 'Matchday 1',
    stage: 'group' as const,
    knockoutRound: null,
    date: '2026-06-11',
    decidedByPenalties: false,
    group: `Group ${group}`,
  }));
}

/** Deterministic completed group stage for tests (72 matches). */
export function completeGroupStageMatches(): NormalizedMatch[] {
  return Object.entries(GROUP_TEAMS).flatMap(([letter, teams]) =>
    roundRobinResults(letter, teams, letter.toLowerCase()),
  );
}

export const R32_FIXTURES: Array<{ num: number; team1: string; team2: string }> = [
  { num: 73, team1: 'Mexico', team2: 'USA' },
  { num: 74, team1: 'Germany', team2: 'South Africa' },
  { num: 75, team1: 'Japan', team2: 'Scotland' },
  { num: 76, team1: 'Brazil', team2: 'Sweden' },
  { num: 77, team1: 'France', team2: 'Morocco' },
  { num: 78, team1: 'Ecuador', team2: 'Senegal' },
  { num: 79, team1: 'Mexico', team2: 'Australia' },
  { num: 80, team1: 'England', team2: 'Norway' },
  { num: 81, team1: 'USA', team2: 'Netherlands' },
  { num: 82, team1: 'Belgium', team2: 'Iran' },
  { num: 83, team1: 'Colombia', team2: 'Croatia' },
  { num: 84, team1: 'Spain', team2: 'Algeria' },
  { num: 85, team1: 'Canada', team2: 'Tunisia' },
  { num: 86, team1: 'Argentina', team2: 'Austria' },
  { num: 87, team1: 'Portugal', team2: 'Turkey' },
  { num: 88, team1: 'Paraguay', team2: 'Switzerland' },
];

export function placeholderR32Except(
  ...except: number[]
): NormalizedMatch[] {
  return R32_FIXTURES.filter((fixture) => !except.includes(fixture.num)).map(
    (fixture) => ({
      id: `m${fixture.num}`,
      team1: fixture.team1,
      team2: fixture.team2,
      homeScore: null,
      awayScore: null,
      roundLabel: 'Round of 32',
      stage: 'knockout' as const,
      knockoutRound: 'roundOf32' as const,
      date: '2026-06-28',
      decidedByPenalties: false,
    }),
  );
}
