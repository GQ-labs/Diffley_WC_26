import { getTeamOwner, type TeamOwnerMap } from '../../lib/draftUtils';
import { getTeamCode } from '../../lib/teamIso';
import { TeamFlag } from './TeamFlag';
import styles from './BracketMatchup.module.css';

interface BracketTeamCompactProps {
  team: string;
  owner?: string;
  align?: 'start' | 'end';
}

function BracketTeamCompact({ team, owner, align = 'start' }: BracketTeamCompactProps) {
  if (team === 'TBD') {
    return (
      <span
        className={`${styles.compactTeam} ${align === 'end' ? styles.compactTeamEnd : ''}`}
        aria-label="To be determined"
      >
        <span className={styles.tbd}>TBD</span>
      </span>
    );
  }

  const code = getTeamCode(team);

  return (
    <span
      className={`${styles.compactTeam} ${align === 'end' ? styles.compactTeamEnd : ''}`}
      title={team}
      aria-label={owner ? `${team}, ${owner}` : team}
    >
      <TeamFlag team={team} />
      <span className={styles.compactBody}>
        <span className={styles.code}>{code}</span>
        {owner ? <span className={styles.owner}>{owner}</span> : null}
      </span>
    </span>
  );
}

interface BracketMatchupProps {
  team1: string;
  score: string;
  team2: string;
  owners: TeamOwnerMap;
}

/** Flag + 3-letter code + owner — for narrow bracket tree cards. */
export function BracketMatchup({
  team1,
  score,
  team2,
  owners,
}: BracketMatchupProps) {
  return (
    <div className={styles.matchup} aria-label={`${team1} ${score} ${team2}`}>
      <BracketTeamCompact
        team={team1}
        owner={getTeamOwner(team1, owners)}
        align="start"
      />
      <span className={styles.score}>{score}</span>
      <BracketTeamCompact
        team={team2}
        owner={getTeamOwner(team2, owners)}
        align="end"
      />
    </div>
  );
}
