import { useTournament } from '../../context/TournamentContext';
import { milestoneLabels } from '../../lib/labels';
import { PageHeader } from '../layout/TabNav';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/StatusMessage';
import tableStyles from '../ui/DataTable.module.css';
import { DataTable } from '../ui/DataTable';
import { TeamName } from '../ui/TeamName';

export function TeamsTab() {
  const { loading, error, teams, refresh } = useTournament();

  if (loading && teams.length === 0) return <LoadingState />;
  if (error && teams.length === 0) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <section aria-labelledby="teams-heading">
      <PageHeader
        id="teams-heading"
        title="Team standings"
        description="All 48 teams ranked by points. Owner shows who drafted each team."
      />

      <DataTable
        caption="Team standings"
        data={teams}
        rowKey={(row) => row.team}
        columns={[
          {
            id: 'rank',
            header: '#',
            align: 'center',
            className: tableStyles.rank,
            render: (row) => row.rank,
          },
          {
            id: 'team',
            header: 'Team',
            render: (row) => <TeamName team={row.team} strong />,
          },
          {
            id: 'owner',
            header: 'Owner',
            hideOnMobile: true,
            render: (row) => row.owner,
          },
          {
            id: 'played',
            header: 'P',
            align: 'center',
            hideOnMobile: true,
            render: (row) => row.played,
          },
          {
            id: 'match',
            header: 'Match',
            align: 'right',
            render: (row) => row.matchPoints,
          },
          {
            id: 'milestone',
            header: 'Milestone',
            hideOnMobile: true,
            render: (row) => milestoneLabels[row.milestoneKey],
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
    </section>
  );
}
