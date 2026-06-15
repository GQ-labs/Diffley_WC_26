import type { UpcomingMatchday } from '../../lib/upcomingMatches';
import { getFifaMatchUrl } from '../../lib/fifa';
import { FixtureMatchup } from './TeamName';
import styles from './InfoCard.module.css';

interface UpcomingMatchesCardProps {
  upcoming: UpcomingMatchday | null;
}

export function UpcomingMatchesCard({ upcoming }: UpcomingMatchesCardProps) {
  if (!upcoming || upcoming.matches.length === 0) {
    return (
      <div className={styles.card}>
        <p className={styles.label}>Upcoming matches</p>
        <p className={styles.detail}>No more fixtures scheduled for this matchday.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <p className={styles.label}>Upcoming matches</p>
      <p className={styles.detail}>
        {upcoming.matchdayLabel} matchday · kickoffs UK time
      </p>
      <ul className={styles.upcomingList}>
        {upcoming.matches.map((match) => (
          <UpcomingMatchRow key={match.id} match={match} />
        ))}
      </ul>
    </div>
  );
}

function UpcomingMatchRow({
  match,
}: {
  match: UpcomingMatchday['matches'][number];
}) {
  const url = getFifaMatchUrl(match.matchdayDate, match.team1, match.team2);
  const label = `${match.team1} vs ${match.team2} at ${match.kickoffUkLabel} UK`;

  const content = (
    <>
      <span className={styles.upcomingKickoff}>{match.kickoffUkLabel}</span>
      <span className={styles.upcomingMatchup}>
        <FixtureMatchup
          team1={match.team1}
          score="vs"
          team2={match.team2}
        />
      </span>
      <span className={styles.upcomingRound}>{match.roundLabel}</span>
    </>
  );

  if (!url) {
    return <li className={styles.upcomingListItem}>{content}</li>;
  }

  return (
    <li className={styles.upcomingListItem}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.upcomingLink}
        aria-label={`${label} on FIFA.com`}
      >
        {content}
      </a>
    </li>
  );
}
