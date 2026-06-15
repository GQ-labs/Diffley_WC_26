import type { LatestResult } from '../../lib/recentMatch';
import { getFifaMatchUrl } from '../../lib/fifa';
import { FixtureMatchup } from './TeamName';
import styles from './InfoCard.module.css';

interface RecentResultsCardProps {
  results: LatestResult[];
}

export function RecentResultsCard({ results }: RecentResultsCardProps) {
  if (results.length === 0) return null;

  return (
    <div className={styles.card}>
      <p className={styles.label}>Latest results</p>
      <ul className={styles.resultsList}>
        {results.map((result) => (
          <RecentResultRow key={result.id} result={result} />
        ))}
      </ul>
    </div>
  );
}

function RecentResultRow({ result }: { result: LatestResult }) {
  const score = `${result.homeScore}–${result.awayScore}`;
  const url = getFifaMatchUrl(result.date, result.team1, result.team2);
  const label = `${result.team1} vs ${result.team2} on FIFA.com`;

  const content = (
    <>
      <FixtureMatchup
        team1={result.team1}
        score={score}
        team2={result.team2}
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
