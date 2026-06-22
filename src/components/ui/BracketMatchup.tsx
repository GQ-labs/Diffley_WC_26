import { getTeamOwner, type TeamOwnerMap } from '../../lib/draftUtils';
import { getTeamCode } from '../../lib/teamIso';
import { TeamFlag } from './TeamFlag';
import styles from './BracketMatchup.module.css';

interface BracketTeamCodeProps {
  team: string;
  align?: 'start' | 'end';
}

function BracketTeamCode({ team, align = 'start' }: BracketTeamCodeProps) {
  if (team === 'TBD') {
    return (
      <span
        className={`${styles.teamCode} ${align === 'end' ? styles.teamCodeEnd : ''}`}
      >
        <span className={styles.tbd}>TBD</span>
      </span>
    );
  }

  const code = getTeamCode(team);

  return (
    <span
      className={`${styles.teamCode} ${align === 'end' ? styles.teamCodeEnd : ''}`}
      title={team}
    >
      <TeamFlag team={team} />
      <span className={styles.code}>{code}</span>
    </span>
  );
}

interface BracketMatchupProps {
  team1: string;
  score: string;
  team2: string;
  owners: TeamOwnerMap;
}

/** Flag + 3-letter code on one row; owner names on a second row. */
export function BracketMatchup({
  team1,
  score,
  team2,
  owners,
}: BracketMatchupProps) {
  const owner1 = getTeamOwner(team1, owners);
  const owner2 = getTeamOwner(team2, owners);

  return (
    <div
      className={styles.matchup}
      aria-label={`${team1} ${score} ${team2}`}
    >
      <div className={styles.teamsRow}>
        <BracketTeamCode team={team1} align="start" />
        <span className={styles.score}>{score}</span>
        <BracketTeamCode team={team2} align="end" />
      </div>
      {(owner1 || owner2) && (
        <div className={styles.ownersRow}>
          <span className={styles.owner}>{owner1 ?? ''}</span>
          <span className={styles.owner}>{owner2 ?? ''}</span>
        </div>
      )}
    </div>
  );
}
