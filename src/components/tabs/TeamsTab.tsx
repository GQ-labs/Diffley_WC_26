import { useState } from 'react';
import type { RankedTeamStanding } from '../../lib/aggregate';
import { useTournament } from '../../context/TournamentContext';
import { getFifaMatchUrl } from '../../lib/fifa';
import { milestoneLabels } from '../../lib/labels';
import { IconChevronDown } from '../icons/IconChevronDown';
import { PageHeader } from '../layout/TabNav';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/StatusMessage';
import tableStyles from '../ui/DataTable.module.css';
import { DataTable } from '../ui/DataTable';
import { TeamName } from '../ui/TeamName';
import styles from './TeamsTab.module.css';

export function TeamsTab() {
  const { loading, error, teams, refresh } = useTournament();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  if (loading && teams.length === 0) return <LoadingState />;
  if (error && teams.length === 0) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <section aria-labelledby="teams-heading">
      <PageHeader
        id="teams-heading"
        title="Team standings"
        description="All 48 teams ranked by points. Click a row to see matches played."
      />

      <DataTable
        caption="Team standings"
        data={teams}
        rowKey={(row) => row.team}
        expandedRowKey={expandedTeam}
        getRowLabel={(row) => row.team}
        onRowClick={(row) =>
          setExpandedTeam((current) =>
            current === row.team ? null : row.team,
          )
        }
        renderExpanded={(row) => <TeamMatchHistory standing={row} />}
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
            render: (row) => (
              <span className={styles.teamCell}>
                <TeamName team={row.team} strong />
                <IconChevronDown
                  className={`${tableStyles.chevron} ${
                    expandedTeam === row.team ? tableStyles.chevronOpen : ''
                  }`}
                />
              </span>
            ),
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

function TeamMatchHistory({ standing }: { standing: RankedTeamStanding }) {
  if (standing.breakdown.length === 0) {
    return (
      <div className={tableStyles.expandPanel}>
        <p className={tableStyles.expandTitle}>Matches — {standing.team}</p>
        <p className={tableStyles.expandEmpty}>No matches played yet.</p>
      </div>
    );
  }

  return (
    <div className={tableStyles.expandPanel}>
      <p className={tableStyles.expandTitle}>Matches — {standing.team}</p>
      <ul className={tableStyles.matchHistory}>
        {standing.breakdown.map((match) => (
          <TeamMatchHistoryRow
            key={match.matchId}
            team={standing.team}
            match={match}
          />
        ))}
      </ul>
    </div>
  );
}

function TeamMatchHistoryRow({
  team,
  match,
}: {
  team: string;
  match: RankedTeamStanding['breakdown'][number];
}) {
  const outcomeLabel =
    match.outcome === 'win' ? 'W' : match.outcome === 'draw' ? 'D' : 'L';
  const score = `${match.goalsFor}–${match.goalsAgainst}`;
  const url = getFifaMatchUrl(match.date, team, match.opponent);
  const label = `${outcomeLabel} ${score} vs ${match.opponent}, ${match.roundLabel}`;

const outcomeClass =
    match.outcome === 'win'
      ? tableStyles.matchOutcomeWin
      : match.outcome === 'draw'
        ? tableStyles.matchOutcomeDraw
        : tableStyles.matchOutcomeLoss;

  const content = (
    <>
      <span className={tableStyles.matchHistoryMain}>
        <span className={`${tableStyles.matchOutcome} ${outcomeClass}`}>
          {outcomeLabel}
        </span>
        <span className={tableStyles.matchScore}>{score}</span>
        <span>vs {match.opponent}</span>
      </span>
      <span className={tableStyles.matchHistoryMeta}>
        {match.roundLabel} · +{match.matchPoints}
        {url && <span className={tableStyles.matchHistoryLink}>FIFA</span>}
      </span>
    </>
  );

  if (!url) {
    return <li className={tableStyles.matchHistoryItem}>{content}</li>;
  }

  return (
    <li className={tableStyles.matchHistoryItem}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={tableStyles.matchHistoryLinkRow}
        aria-label={`${label} on FIFA.com`}
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </a>
    </li>
  );
}
