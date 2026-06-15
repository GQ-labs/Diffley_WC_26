import type { CurrentMatch } from '../../lib/liveMatch';
import { getFifaMatchUrl } from '../../lib/fifa';
import { FixtureMatchup } from './TeamName';
import styles from './InfoCard.module.css';

interface CurrentMatchCardProps {
  match: CurrentMatch | null;
  lastUpdated: Date | null;
}

export function CurrentMatchCard({ match, lastUpdated }: CurrentMatchCardProps) {
  if (!match) return null;

  const score = `${match.homeScore}–${match.awayScore}`;
  const url = getFifaMatchUrl(match.matchdayDate, match.team1, match.team2);
  const status = match.minute ?? match.statusLabel;

  const content = (
    <>
      <div className={styles.currentHeader}>
        <p className={styles.label}>Current match</p>
        {match.isLive && (
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} aria-hidden />
            Live
          </span>
        )}
      </div>
      <p className={styles.currentScore}>
        <FixtureMatchup
          team1={match.team1}
          score={score}
          team2={match.team2}
          className={styles.primary}
        />
      </p>
      <p className={styles.detail}>
        <span className={styles.currentStatus}>{status}</span>
        {lastUpdated && (
          <span className={styles.liveUpdated}>
            Updated {formatUpdated(lastUpdated)}
          </span>
        )}
      </p>
    </>
  );

  if (!url) {
    return <div className={`${styles.card} ${styles.currentCard}`}>{content}</div>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.card} ${styles.currentCard} ${styles.cardLink}`}
      aria-label={`${match.team1} vs ${match.team2} live on FIFA.com`}
    >
      {content}
    </a>
  );
}

function formatUpdated(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
