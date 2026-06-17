import type { LatestResult } from '../../lib/recentMatch';
import type { TeamOwnerMap } from '../../lib/draftUtils';
import { getFifaMatchUrl } from '../../lib/fifa';
import { useTeamOwners } from '../../hooks/useTeamOwners';
import { usePlayerTeamSet } from '../../hooks/usePlayerTeamSet';
import { FixtureMatchupWithOwners } from './TeamName';
import styles from './InfoCard.module.css';

interface RecentResultsCardProps {
  results: LatestResult[];
  playerFilter?: string;
}

export function RecentResultsCard({
  results,
  playerFilter = '',
}: RecentResultsCardProps) {
  const owners = useTeamOwners();
  const highlightPlayerTeams = usePlayerTeamSet(playerFilter);

  if (results.length === 0) return null;

  return (
    <div className={styles.card}>
      <p className={styles.label}>Latest results</p>
      <ul className={styles.resultsList}>
        {results.map((result) => (
          <RecentResultRow
            key={result.id}
            result={result}
            owners={owners}
            highlightPlayerTeams={highlightPlayerTeams}
          />
        ))}
      </ul>
    </div>
  );
}

function RecentResultRow({
  result,
  owners,
  highlightPlayerTeams,
}: {
  result: LatestResult;
  owners: TeamOwnerMap;
  highlightPlayerTeams: Set<string>;
}) {
  const score = `${result.homeScore}–${result.awayScore}`;
  const url = getFifaMatchUrl(result.date, result.team1, result.team2);
  const label = `${result.team1} vs ${result.team2} on FIFA.com`;

  const content = (
    <>
      <FixtureMatchupWithOwners
        team1={result.team1}
        score={score}
        team2={result.team2}
        owners={owners}
        highlightPlayerTeams={highlightPlayerTeams}
        className={styles.resultMatchup}
      />
      <span className={styles.resultMeta}>
        {result.round} · {result.date}
      </span>
    </>
  );

  if (!url) {
    return <li className={styles.resultsListItem}>{content}</li>;
  }

  return (
    <li className={styles.resultsListItem}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.resultsLink}
        aria-label={label}
      >
        {content}
      </a>
    </li>
  );
}
