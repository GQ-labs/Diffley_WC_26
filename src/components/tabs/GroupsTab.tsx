import { useEffect, useMemo, useState } from 'react';
import type { RankedTeamStanding } from '../../lib/aggregate';
import { draftConfig } from '../../config';
import { getPlayerTeamSet } from '../../lib/draftUtils';
import { useTournament } from '../../context/TournamentContext';
import { buildAllGroupTables, type GroupQualificationStatus, type GroupTable } from '../../lib/groups';
import { getFifaMatchUrl } from '../../lib/fifa';
import { milestoneLabels } from '../../lib/labels';
import { IconChevronDown } from '../icons/IconChevronDown';
import { PageHeader } from '../layout/TabNav';
import navStyles from '../layout/TabNav.module.css';
import { PlayerFilter } from '../ui/PlayerFilter';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState, EmptyState } from '../ui/StatusMessage';
import tableStyles from '../ui/DataTable.module.css';
import { DataTable } from '../ui/DataTable';
import { TeamName } from '../ui/TeamName';
import styles from './GroupsTab.module.css';

interface GroupsTabProps {
  playerFilter: string;
  onPlayerFilterChange: (playerId: string) => void;
}

const QUALIFICATION_LABEL: Record<GroupQualificationStatus, string> = {
  qualified: 'Qualified',
  possible: 'In contention',
  eliminated: 'Out',
  'third-live': 'Best 3rd',
  'third-out': '3rd out',
  pending: '',
};

export function GroupsTab({
  playerFilter,
  onPlayerFilterChange,
}: GroupsTabProps) {
  const { loading, error, teams, matches, refresh } = useTournament();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const playerTeams = useMemo(
    () => getPlayerTeamSet(draftConfig, playerFilter),
    [playerFilter],
  );

  const groupTables = useMemo(() => buildAllGroupTables(matches), [matches]);

  const standingsByTeam = useMemo(
    () => new Map(teams.map((team) => [team.team, team])),
    [teams],
  );

  const visibleGroups = useMemo(() => {
    if (playerTeams.size === 0) return groupTables;
    return groupTables
      .map((table) => ({
        ...table,
        rows: table.rows.filter((row) => playerTeams.has(row.team)),
      }))
      .filter((table) => table.rows.length > 0);
  }, [groupTables, playerTeams]);

  const playerName = useMemo(() => {
    if (!playerFilter) return null;
    return draftConfig.players.find((player) => player.id === playerFilter)?.name;
  }, [playerFilter]);

  useEffect(() => {
    if (
      expandedTeam &&
      !visibleGroups.some((group) =>
        group.rows.some((row) => row.team === expandedTeam),
      )
    ) {
      setExpandedTeam(null);
    }
  }, [expandedTeam, visibleGroups]);

  if (loading && teams.length === 0) return <LoadingState />;
  if (error && teams.length === 0) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <section aria-labelledby="groups-heading">
      <PageHeader
        id="groups-heading"
        title="Groups"
        description={
          playerName
            ? `${playerName}'s teams by group · click a row to see matches played`
            : 'Group standings A through L. Click a row to see matches played.'
        }
        action={
          <div className={navStyles.pageHeaderActions}>
            <PlayerFilter value={playerFilter} onChange={onPlayerFilterChange} />
          </div>
        }
      />

      {visibleGroups.length === 0 ? (
        <EmptyState message={`No teams found for ${playerName ?? 'this player'}.`} />
      ) : (
        <div className={styles.groupList}>
          {visibleGroups.map((group) => (
            <GroupSection
              key={group.letter}
              group={group}
              standingsByTeam={standingsByTeam}
              expandedTeam={expandedTeam}
              onToggleTeam={(team) =>
                setExpandedTeam((current) => (current === team ? null : team))
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function GroupSection({
  group,
  standingsByTeam,
  expandedTeam,
  onToggleTeam,
}: {
  group: GroupTable;
  standingsByTeam: Map<string, RankedTeamStanding>;
  expandedTeam: string | null;
  onToggleTeam: (team: string) => void;
}) {
  return (
    <section className={styles.groupSection} aria-labelledby={`group-${group.letter}`}>
      <div className={styles.groupHeader}>
        <h3 id={`group-${group.letter}`} className={styles.groupTitle}>
          {group.label}
        </h3>
        <p className={styles.groupMeta}>
          {group.complete ? 'Final standings' : 'Live standings'}
        </p>
      </div>

      <DataTable
        caption={`${group.label} standings`}
        data={group.rows}
        rowKey={(row) => row.team}
        expandedRowKey={expandedTeam}
        getRowLabel={(row) => row.team}
        onRowClick={(row) => onToggleTeam(row.team)}
        renderExpanded={(row) => {
          const standing = standingsByTeam.get(row.team);
          if (!standing) {
            return (
              <div className={tableStyles.expandPanel}>
                <p className={tableStyles.expandEmpty}>No pool data for this team.</p>
              </div>
            );
          }
          return <TeamMatchHistory standing={standing} />;
        }}
        columns={[
          {
            id: 'position',
            header: '#',
            align: 'center',
            className: tableStyles.rank,
            render: (row) => row.position,
          },
          {
            id: 'team',
            header: 'Team',
            render: (row) => (
              <span className={styles.teamCell}>
                <TeamName team={row.team} strong />
                <QualificationBadge status={row.qualification} projected={row.projected} />
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
            render: (row) => standingsByTeam.get(row.team)?.owner ?? '—',
          },
          {
            id: 'played',
            header: 'P',
            align: 'center',
            hideOnMobile: true,
            render: (row) => row.played,
          },
          {
            id: 'record',
            header: 'W-D-L',
            align: 'center',
            hideOnMobile: true,
            render: (row) => `${row.wins}-${row.draws}-${row.losses}`,
          },
          {
            id: 'gd',
            header: 'GD',
            align: 'center',
            hideOnMobile: true,
            render: (row) =>
              row.goalDifference > 0
                ? `+${row.goalDifference}`
                : row.goalDifference,
          },
          {
            id: 'groupPts',
            header: 'Grp',
            align: 'center',
            render: (row) => row.points,
          },
          {
            id: 'total',
            header: 'Pool',
            align: 'right',
            render: (row) => (
              <span className={tableStyles.points}>
                {standingsByTeam.get(row.team)?.totalPoints ?? '—'}
              </span>
            ),
          },
        ]}
      />
    </section>
  );
}

function QualificationBadge({
  status,
  projected,
}: {
  status: GroupQualificationStatus;
  projected: boolean;
}) {
  const label = QUALIFICATION_LABEL[status];
  if (!label) return null;

  return (
    <span
      className={`${styles.qualBadge} ${styles[`qual_${status}`]}`}
      title={projected ? 'Projected from current results' : undefined}
    >
      {label}
      {projected ? '?' : ''}
    </span>
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
      <p className={tableStyles.expandTitle}>
        Matches — {standing.team} · {milestoneLabels[standing.milestoneKey]} · +
        {standing.milestonePoints} bonus
      </p>
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
      </span>
    </>
  );

  if (!url) {
    return (
      <li className={tableStyles.matchHistoryItem}>
        <div className={tableStyles.matchHistoryRow}>{content}</div>
      </li>
    );
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
        <span className={tableStyles.matchHistoryLink}>FIFA</span>
      </a>
    </li>
  );
}
