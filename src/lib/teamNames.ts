import teamAliases from '../../data/team-aliases.json';

const aliasMap = teamAliases.aliases as Record<string, string>;

export function normalizeTeamName(name: string): string {
  const trimmed = name.trim();
  return aliasMap[trimmed] ?? trimmed;
}

export function createTeamNormalizer(
  extraAliases: Record<string, string> = {},
): (name: string) => string {
  const merged = { ...aliasMap, ...extraAliases };
  return (name: string) => {
    const trimmed = name.trim();
    return merged[trimmed] ?? trimmed;
  };
}
