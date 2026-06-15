import { useTournament } from '../../context/TournamentContext';
import { PageHeader } from '../layout/TabNav';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState, EmptyState } from '../ui/StatusMessage';
import tableStyles from '../ui/DataTable.module.css';
import { DataTable } from '../ui/DataTable';

export function FixturesTab() {
  const { loading, error, fixtures, refreshing, refresh } = useTournament();

  if (loading && fixtures.length === 0) return <LoadingState />;
  if (error && fixtures.length === 0) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <section aria-labelledby="fixtures-heading">
      <PageHeader
        id="fixtures-heading"
        title="Fixtures and results"
        description={`${fixtures.filter((f) => f.status === 'final').length} played · ${fixtures.filter((f) => f.status === 'scheduled').length} scheduled`}
        action={
          <Button
            icon
            spinning={refreshing}
            onClick={() => void refresh()}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
      />

      {fixtures.length === 0 ? (
        <EmptyState message="No fixtures loaded. Check your connection and try Refresh." />
      ) : (
        <DataTable
          caption="Fixtures and results"
          data={fixtures}
          rowKey={(row) => row.id}
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
            render: (row) => row.team1,
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
            render: (row) => row.team2,
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
