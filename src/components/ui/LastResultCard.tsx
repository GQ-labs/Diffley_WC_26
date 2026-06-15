import type { LatestResult } from '../../lib/recentMatch';
import { FixtureMatchup } from './TeamName';
import styles from './InfoCard.module.css';

export function LastResultCard({ result }: { result: LatestResult }) {
  const score =
    result.homeScore !== null && result.awayScore !== null
      ? `${result.homeScore}–${result.awayScore}`
      : '—';

  return (
    <div className={styles.card}>
      <p className={styles.label}>Latest result</p>
      <p className={styles.value}>
        <FixtureMatchup
          team1={result.team1}
          score={score}
          team2={result.team2}
          date={result.date}
          className={styles.primary}
        />
      </p>
      <p className={styles.detail}>
        {result.round} · {result.date}
      </p>
    </div>
  );
}
