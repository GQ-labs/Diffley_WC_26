import { useMemo } from 'react';
import { draftConfig } from '../../config';
import { getPlayerTeamSet, matchInvolvesPlayerTeams } from '../../lib/draftUtils';
import { getFifaMatchUrl, openFifaUrl } from '../../lib/fifa';
import { useTournament } from '../../context/TournamentContext';
import { PageHeader } from '../layout/TabNav';
import navStyles from '../layout/TabNav.module.css';
import { Button } from '../ui/Button';
import { PlayerFilter } from '../ui/PlayerFilter';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState, EmptyState } from '../ui/StatusMessage';
import tableStyles from '../ui/DataTable.module.css';
import { DataTable } from '../ui/DataTable';
import { TeamName } from '../ui/TeamName';

interface FixturesTabProps {
  playerFilter: string;
  onPlayerFilterChange: (playerId: string) => void;
}

export function FixturesTab({
  playerFilter,
  onPlayerFilterChange,
}: FixturesTabProps) {
  const { loading, error, fixtures, refreshing, refresh } = useTournament();
  const playerTeams = useMemo(
    () => getPlayerTeamSet(draftConfig, playerFilter),
    [playerFilter],
  );

  const rows = useMemo(
    () =>
      fixtures.filter((fixture) =>
        matchInvolvesPlayerTeams(fixture.team1, fixture.team2, playerTeams),
      ),
    [fixtures, playerTeams],
  );

  const playerName = useMemo(() => {
    if (!playerFilter) return null;
    return draftConfig.players.find((player) => player.id === playerFilter)?.name;
  }, [playerFilter]);

  if (loading && fixtures.length === 0) return <LoadingState />;
  if (error && fixtures.length === 0) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  const played = rows.filter((fixture) => fixture.status === 'final').length;
  const scheduled = rows.filter((fixture) => fixture.status === 'scheduled').length;

  return (
    <section aria-labelledby="fixtures-heading">
      <PageHeader
        id="fixtures-heading"
        title="Fixtures and results"
        description={
          playerName
            ? `${playerName}'s teams · ${played} played · ${scheduled} scheduled`
            : `${played} played · ${scheduled} scheduled`
        }
        action={
          <div className={navStyles.pageHeaderActions}>
            <PlayerFilter value={playerFilter} onChange={onPlayerFilterChange} />
            <Button
              icon
              spinning={refreshing}
              onClick={() => void refresh()}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          message={
            playerName
              ? `No fixtures found for ${playerName}'s teams.`
              : 'No fixtures loaded. Check your connection and try Refresh.'
          }
        />
      ) : (
        <DataTable
          caption="Fixtures and results"
          data={rows}
          rowKey={(row) => row.id}
          onRowClick={(row) => {
            const url = getFifaMatchUrl(row.date, row.team1, row.team2);
            if (url) openFifaUrl(url);
          }}
          isRowClickable={(row) =>
            Boolean(getFifaMatchUrl(row.date, row.team1, row.team2))
          }
          getRowLabel={(row) => `${row.team1} vs ${row.team2}, ${row.date}`}
          rowClickHint="Open match on FIFA.com"
          columns={[
            {
              id: 'date',
              header: 'Date',
              render: (row) => row.date,
            },
            {
              id: 'round',
              header: 'Round',
              hideOnMobile: true,
              render: (row) => row.round,
            },
            {
              id: 'team1',
              header: 'Home',
              render: (row) => <TeamName team={row.team1} />,
            },
            {
              id: 'score',
              header: 'Score',
              align: 'center',
              render: (row) => (
                <span className={tableStyles.score}>{row.score}</span>
              ),
            },
            {
              id: 'team2',
              header: 'Away',
              render: (row) => <TeamName team={row.team2} />,
            },
            {
              id: 'status',
              header: 'Status',
              align: 'right',
              hideOnMobile: true,
              render: (row) => (
                <span
                  className={`${tableStyles.status} ${
                    row.status === 'final'
                      ? tableStyles.statusFinal
                      : tableStyles.statusScheduled
                  }`}
                >
                  {row.status}
                </span>
              ),
            },
          ]}
        />
      )}
    </section>
  );
}
