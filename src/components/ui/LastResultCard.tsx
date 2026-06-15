import type { LatestResult } from '../../lib/recentMatch';
import { getFifaMatchUrl } from '../../lib/fifa';
import { FixtureMatchup } from './TeamName';
import styles from './InfoCard.module.css';

export function LastResultCard({ result }: { result: LatestResult }) {
  const score =
    result.homeScore !== null && result.awayScore !== null
      ? `${result.homeScore}–${result.awayScore}`
      : '—';
  const matchUrl = getFifaMatchUrl(result.date, result.team1, result.team2);
  const matchLabel = `${result.team1} vs ${result.team2} on FIFA.com`;

  const content = (
    <>
      <p className={styles.label}>Latest result</p>
      <p className={styles.value}>
        <FixtureMatchup
          team1={result.team1}
          score={score}
          team2={result.team2}
          className={styles.primary}
        />
      </p>
      <p className={styles.detail}>
        {result.round} · {result.date}
        {matchUrl && <span className={styles.linkHint}> · Open on FIFA.com</span>}
      </p>
    </>
  );

  if (!matchUrl) {
    return <div className={styles.card}>{content}</div>;
  }

  return (
    <a
      href={matchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.card} ${styles.cardLink}`}
      aria-label={matchLabel}
    >
      {content}
    </a>
  );
}
