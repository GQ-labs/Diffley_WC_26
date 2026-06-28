import type { NormalizedMatch } from './types/match';

export const CACHE_KEY = 'diffley-wc-26-matches-v2';

export interface CachedMatchesPayload {
  fetchedAt: string;
  matches: NormalizedMatch[];
}

export function serializeCache(
  matches: NormalizedMatch[],
  fetchedAt: Date,
): string {
  const payload: CachedMatchesPayload = {
    fetchedAt: fetchedAt.toISOString(),
    matches,
  };
  return JSON.stringify(payload);
}

export function parseCache(raw: string): CachedMatchesPayload | null {
  try {
    const data = JSON.parse(raw) as CachedMatchesPayload;
    if (!data.fetchedAt || !Array.isArray(data.matches)) return null;
    return data;
  } catch {
    return null;
  }
}

export function readMatchesCache(): CachedMatchesPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return parseCache(raw);
  } catch {
    return null;
  }
}

export function writeMatchesCache(
  matches: NormalizedMatch[],
  fetchedAt: Date,
): void {
  try {
    localStorage.setItem(CACHE_KEY, serializeCache(matches, fetchedAt));
  } catch {
    // Private browsing or quota — ignore
  }
}
