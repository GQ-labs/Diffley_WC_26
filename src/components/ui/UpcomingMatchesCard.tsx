import type { UpcomingMatchday } from '../../lib/upcomingMatches';
import type { TeamOwnerMap } from '../../lib/draftUtils';
import { getFifaMatchUrl } from '../../lib/fifa';
import { useTeamOwners } from '../../hooks/useTeamOwners';
import { usePlayerTeamSet } from '../../hooks/usePlayerTeamSet';
import { FixtureMatchupWithOwners } from './TeamName';
import styles from './InfoCard.module.css';

interface UpcomingMatchesCardProps {
  upcoming: UpcomingMatchday | null;
  playerFilter?: string;
}

export function UpcomingMatchesCard({
  upcoming,
  playerFilter = '',
}: UpcomingMatchesCardProps) {
  const owners = useTeamOwners();
  const highlightPlayerTeams = usePlayerTeamSet(playerFilter);

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
          <UpcomingMatchRow
            key={match.id}
            match={match}
            owners={owners}
            highlightPlayerTeams={highlightPlayerTeams}
          />
        ))}
      </ul>
    </div>
  );
}

function UpcomingMatchRow({
  match,
  owners,
  highlightPlayerTeams,
}: {
  match: UpcomingMatchday['matches'][number];
  owners: TeamOwnerMap;
  highlightPlayerTeams: Set<string>;
}) {
  const url = getFifaMatchUrl(match.matchdayDate, match.team1, match.team2);
  const label = `${match.team1} vs ${match.team2} at ${match.kickoffUkLabel} UK`;

  const content = (
    <>
      <span className={styles.upcomingKickoff}>{match.kickoffUkLabel}</span>
      <span className={styles.upcomingMatchup}>
        <FixtureMatchupWithOwners
          team1={match.team1}
          score="vs"
          team2={match.team2}
          owners={owners}
          highlightPlayerTeams={highlightPlayerTeams}
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
