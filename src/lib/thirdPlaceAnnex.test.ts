import { describe, expect, it } from 'vitest';
import { annexRowCount, assignThirdPlaceTeams } from './thirdPlaceAnnex';
import { buildAllGroupTables } from './groups';
import { parseOpenFootballJson } from './results';

describe('thirdPlaceAnnex', () => {
  it('loads the full FIFA Annex C table', () => {
    expect(annexRowCount()).toBe(495);
  });

  it('maps Germany and France third-place opponents for the confirmed draw', async () => {
    const res = await fetch(
      'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json',
    );
    const data = await res.json();
    const matches = parseOpenFootballJson(data).filter((m) => m.stage === 'group');
    const tables = buildAllGroupTables(matches);
    const assignment = assignThirdPlaceTeams(tables);

    expect(assignment.get(74)).toBe('Paraguay');
    expect(assignment.get(77)).toBe('Sweden');
  });
});
