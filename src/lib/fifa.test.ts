import { describe, expect, it } from 'vitest';
import {
  getFifaMatchUrl,
  getFifaTeamUrl,
  matchLookupKey,
  teamPairLookupKey,
} from './fifa';

describe('fifa links', () => {
  it('resolves Ivory Coast vs Ecuador on 2026-06-14', () => {
    const url = getFifaMatchUrl('2026-06-14', 'Ivory Coast', 'Ecuador');
    expect(url).toBe(
      'https://www.fifa.com/en/match-centre/match/17/285023/289273/400021467',
    );
  });

  it('matches regardless of home/away order', () => {
    const a = matchLookupKey('2026-06-14', 'Ecuador', 'Ivory Coast');
    const b = matchLookupKey('2026-06-14', 'Ivory Coast', 'Ecuador');
    expect(a).toBe(b);
    expect(getFifaMatchUrl('2026-06-14', 'Ecuador', 'Ivory Coast')).toBeTruthy();
  });

  it('resolves by team pair when openfootball date differs from FIFA UTC date', () => {
    expect(teamPairLookupKey('South Korea', 'Czech Republic')).toBe(
      'Czechia|Korea',
    );
    const url = getFifaMatchUrl('2026-06-11', 'Korea', 'Czechia');
    expect(url).toBe(
      'https://www.fifa.com/en/match-centre/match/17/285023/289273/400021441',
    );
  });

  it('resolves Sweden team page', () => {
    expect(getFifaTeamUrl('Sweden')).toBe(
      'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/sweden/team-news',
    );
  });

  it('resolves Turkey matches using FIFA Türkiye name', () => {
    expect(getFifaMatchUrl('2026-06-19', 'Turkey', 'Paraguay')).toBe(
      'https://www.fifa.com/en/match-centre/match/17/285023/289273/400021460',
    );
    expect(getFifaMatchUrl('2026-06-25', 'Turkey', 'USA')).toBe(
      'https://www.fifa.com/en/match-centre/match/17/285023/289273/400021459',
    );
    expect(getFifaMatchUrl('2026-06-13', 'Australia', 'Turkey')).toBe(
      'https://www.fifa.com/en/match-centre/match/17/285023/289273/400021463',
    );
    expect(getFifaTeamUrl('Turkey')).toBe(
      'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/turkiye/team-news',
    );
  });

  it('normalizes FIFA display names via aliases', () => {
    expect(getFifaTeamUrl("Côte d'Ivoire")).toBe(getFifaTeamUrl('Ivory Coast'));
  });
});
