import { useMemo, useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { milestoneLabels } from '../../lib/labels';
import { getUpcomingMatchday } from '../../lib/upcomingMatches';
import { getLatestResults } from '../../lib/recentMatch';
import type { RankedPlayerStanding } from '../../lib/aggregate';
import { IconChevronDown } from '../icons/IconChevronDown';
import { PageHeader } from '../layout/TabNav';
import { PlayerFilter } from '../ui/PlayerFilter';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState, EmptyState } from '../ui/StatusMessage';
import { UpcomingMatchesCard } from '../ui/UpcomingMatchesCard';
import { CurrentMatchCard } from '../ui/CurrentMatchCard';
import { RecentResultsCard } from '../ui/RecentResultsCard';
import cardStyles from '../ui/InfoCard.module.css';
import tableStyles from '../ui/DataTable.module.css';
import { DataTable } from '../ui/DataTable';
import { TeamName, TeamNameList } from '../ui/TeamName';
import styles from './LeaderboardTab.module.css';

interface LeaderboardTabProps {
  playerFilter: string;
  onPlayerFilterChange: (id: string) => void;
}

export function LeaderboardTab({
  playerFilter,
  onPlayerFilterChange,
}: LeaderboardTabProps) {
  const { loading, error, players, matches, playedCount, refresh, currentMatch, liveMatchUpdated } =
    useTournament();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!playerFilter) return players;
    return players.filter((p) => p.id === playerFilter);
  }, [players, playerFilter]);

  const leader = players[0];
  const leaderId = leader?.id;
  const latestResults = useMemo(() => getLatestResults(matches, 3), [matches]);
  const upcoming = useMemo(() => getUpcomingMatchday(matches), [matches]);

  if (loading && players.length === 0) {
    return <LoadingState message="Fetching tournament results…" />;
  }
  if (error && players.length === 0) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <section aria-labelledby="leaderboard-heading" className={styles.section}>
      <PageHeader
        id="leaderboard-heading"
        title="Lab leaderboard"
        description="Ranked by total points across all three teams."
        action={
          <PlayerFilter value={playerFilter} onChange={onPlayerFilterChange} />
        }
      />

      {!playerFilter && (
        <div className={cardStyles.grid}>
          <UpcomingMatchesCard upcoming={upcoming} />
          <div className={cardStyles.resultsColumn}>
            <CurrentMatchCard
              match={currentMatch}
              lastUpdated={liveMatchUpdated}
            />
            <RecentResultsCard results={latestResults} />
          </div>
        </div>
      )}

      {playedCount === 0 ? (
        <EmptyState message="No match results yet. Scores will appear here once games kick off on 11 June 2026." />
      ) : (
        <DataTable
          caption="Lab leaderboard"
          data={rows}
          rowKey={(row) => row.id}
          leaderKey={!playerFilter ? leaderId : undefined}
          expandedRowKey={expandedId}
          getRowLabel={(row) => row.name}
          onRowClick={(row) =>
            setExpandedId((current) => (current === row.id ? null : row.id))
          }
          renderExpanded={(row) => <PlayerBreakdown row={row} />}
          columns={[
            {
              id: 'rank',
              header: '#',
              align: 'center',
              className: tableStyles.rank,
              render: (row) => (
                <span
                  className={row.rank === 1 ? tableStyles.rankLeader : undefined}
                >
                  {row.rank}
                </span>
              ),
            },
            {
              id: 'player',
              header: 'Player',
              render: (row) => (
                <span className={styles.playerCell}>
                  <span className={styles.playerName}>{row.name}</span>
                  <IconChevronDown
                    className={`${tableStyles.chevron} ${
                      expandedId === row.id ? tableStyles.chevronOpen : ''
                    }`}
                  />
                </span>
              ),
            },
            {
              id: 'teams',
              header: 'Teams',
              hideOnMobile: true,
              render: (row) => (
                <TeamNameList
                  teams={row.teams}
                  className={tableStyles.teamList}
                />
              ),
            },
            {
              id: 'record',
              header: 'W-D-L',
              align: 'center',
              hideOnMobile: true,
              render: (row) => `${row.wins}-${row.draws}-${row.losses}`,
            },
            {
              id: 'match',
              header: 'Match',
              align: 'right',
              render: (row) => row.matchPoints,
            },
            {
              id: 'bonus',
              header: 'Bonus',
              align: 'right',
              render: (row) => row.milestonePoints,
            },
            {
              id: 'total',
              header: 'Total',
              align: 'right',
              render: (row) => (
                <span className={tableStyles.points}>{row.totalPoints}</span>
              ),
            },
          ]}
        />
      )}
    </section>
  );
}

function PlayerBreakdown({ row }: { row: RankedPlayerStanding }) {
  return (
    <div className={tableStyles.expandPanel}>
      <p className={tableStyles.expandTitle}>Team breakdown — {row.name}</p>
      <div className={tableStyles.expandGrid}>
        {row.teamStandings.map((team) => (
          <div key={team.team} className={tableStyles.expandItem}>
            <TeamName team={team.team} />
            <span>
              {team.matchPoints} + {team.milestonePoints} (
              {milestoneLabels[team.milestoneKey]}) = {team.totalPoints}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
