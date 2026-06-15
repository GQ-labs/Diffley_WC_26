import type { RankedPlayerStanding } from '../../lib/aggregate';
import { TeamNameList } from './TeamName';
import styles from './InfoCard.module.css';

export function LeaderCard({ leader }: { leader: RankedPlayerStanding }) {
  return (
    <div className={styles.card} data-variant="leader">
      <p className={styles.label}>Current leader</p>
      <p className={styles.value}>
        <span className={styles.primary}>{leader.name}</span>
        <span className={styles.meta}>{leader.totalPoints} pts</span>
      </p>
      <div className={styles.detail}>
        <TeamNameList teams={leader.teams} separator=" · " />
      </div>
    </div>
  );
}
