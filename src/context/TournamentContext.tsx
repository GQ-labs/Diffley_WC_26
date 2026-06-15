import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  buildPlayerStandings,
  buildRankedTeamStandings,
  type RankedPlayerStanding,
  type RankedTeamStanding,
} from '../lib/aggregate';
import { readMatchesCache, writeMatchesCache } from '../lib/cache';
import { buildFixtureRows, countFinalFixtures, type FixtureRow } from '../lib/fixtures';
import { countAppliedOverrides } from '../lib/overrides';
import { loadTournamentMatches } from '../lib/results';
import type { NormalizedMatch } from '../lib/types/match';
import {
  draftConfig,
  overridesConfig,
  RESULTS_URL,
  scoringConfig,
} from '../config';

export type DataSource = 'live' | 'cache' | 'none';

interface TournamentContextValue {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  warning: string | null;
  dataSource: DataSource;
  lastUpdated: Date | null;
  overrideCount: number;
  matches: NormalizedMatch[];
  players: RankedPlayerStanding[];
  teams: RankedTeamStanding[];
  fixtures: FixtureRow[];
  playedCount: number;
  refresh: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextValue | null>(null);

function computeState(matches: NormalizedMatch[], lastUpdated: Date | null) {
  const players = buildPlayerStandings(draftConfig, matches, scoringConfig);
  const teams = buildRankedTeamStandings(draftConfig, matches, scoringConfig);
  const fixtures = buildFixtureRows(matches);

  return {
    matches,
    players,
    teams,
    fixtures,
    playedCount: countFinalFixtures(fixtures),
    lastUpdated,
    overrideCount: countAppliedOverrides(matches, overridesConfig.matches),
  };
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('none');
  const [data, setData] = useState(() => computeState([], null));

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const cached = readMatchesCache();
    const hasCache = Boolean(cached?.matches.length);

    if (!isRefresh && hasCache && cached) {
      setData(computeState(cached.matches, new Date(cached.fetchedAt)));
      setDataSource('cache');
      setLoading(false);
    }

    setError(null);
    setWarning(null);

    try {
      const matches = await loadTournamentMatches(
        RESULTS_URL,
        overridesConfig.matches,
      );
      const fetchedAt = new Date();
      writeMatchesCache(matches, fetchedAt);
      setData(computeState(matches, fetchedAt));
      setDataSource('live');
      setError(null);
      setWarning(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load tournament data';

      if (hasCache && cached) {
        setData(computeState(cached.matches, new Date(cached.fetchedAt)));
        setDataSource('cache');
        setWarning(
          `Showing cached results from ${formatTimestamp(cached.fetchedAt)}. Refresh failed: ${message}`,
        );
        setError(null);
      } else {
        setData(computeState([], null));
        setDataSource('none');
        setError(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const value = useMemo<TournamentContextValue>(
    () => ({
      loading,
      refreshing,
      error,
      warning,
      dataSource,
      lastUpdated: data.lastUpdated,
      overrideCount: data.overrideCount,
      matches: data.matches,
      players: data.players,
      teams: data.teams,
      fixtures: data.fixtures,
      playedCount: data.playedCount,
      refresh: () => load(true),
    }),
    [loading, refreshing, error, warning, dataSource, data, load],
  );

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error('useTournament must be used within TournamentProvider');
  }
  return ctx;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
