import { describe, expect, it } from 'vitest';
import { buildBracketTree } from './bracket';
import { parseOpenFootballJson } from './results';

describe('bracket integration', () => {
  it('uses openfootball R32 pairings when listed', async () => {
    const res = await fetch(
      'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json',
    );
    const data = await res.json();
    const matches = parseOpenFootballJson(data);
    const tree = buildBracketTree(matches);

    expect(matches.filter((m) => m.stage === 'knockout').length).toBeGreaterThanOrEqual(16);

    const m74 = tree.roundOf32.find((m) => m.num === 74);
    const m77 = tree.roundOf32.find((m) => m.num === 77);

    expect(m74?.team1).toBe('Germany');
    expect(m74?.team2).toBe('Paraguay');
    expect(m77?.team1).toBe('France');
    expect(m77?.team2).toBe('Sweden');
    expect(tree.projected).toBe(false);
  });

  it('projects wrong third-place slots without openfootball R32 fixtures', async () => {
    const res = await fetch(
      'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json',
    );
    const data = await res.json();
    const matches = parseOpenFootballJson(data).filter((m) => m.stage === 'group');
    const tree = buildBracketTree(matches);

    const m74 = tree.roundOf32.find((m) => m.num === 74);
    const m77 = tree.roundOf32.find((m) => m.num === 77);

    expect(m74?.team1).toBe('Germany');
    expect(m74?.team2).toBe('Paraguay');
    expect(m77?.team1).toBe('France');
    expect(m77?.team2).toBe('Sweden');
  });
});
