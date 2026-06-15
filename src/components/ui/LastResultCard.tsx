import type { LatestResult } from '../../lib/recentMatch';
import styles from './InfoCard.module.css';

export function LastResultCard({ result }: { result: LatestResult }) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>Latest result</p>
      <p className={styles.value}>
        <span className={styles.primary}>
          {result.team1} {result.homeScore}–{result.awayScore} {result.team2}
        </span>
      </p>
      <p className={styles.detail}>
        {result.round} · {result.date}
      </p>
    </div>
  );
}
