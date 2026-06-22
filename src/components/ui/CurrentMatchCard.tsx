import type { CurrentMatch } from '../../lib/liveMatch';
import { getFifaMatchUrl } from '../../lib/fifa';
import { useTeamOwners } from '../../hooks/useTeamOwners';
import { usePlayerTeamSet } from '../../hooks/usePlayerTeamSet';
import { FixtureMatchupWithOwners } from './TeamName';
import styles from './InfoCard.module.css';

interface CurrentMatchCardProps {
  match: CurrentMatch | null;
  lastUpdated: Date | null;
  playerFilter?: string;
}

export function CurrentMatchCard({
  match,
  lastUpdated,
  playerFilter = '',
}: CurrentMatchCardProps) {
  const owners = useTeamOwners();
  const highlightPlayerTeams = usePlayerTeamSet(playerFilter);

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
        <FixtureMatchupWithOwners
          team1={match.team1}
          score={score}
          team2={match.team2}
          owners={owners}
          highlightPlayerTeams={highlightPlayerTeams}
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
