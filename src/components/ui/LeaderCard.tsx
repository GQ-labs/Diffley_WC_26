import type { RankedPlayerStanding } from '../../lib/aggregate';
import styles from './InfoCard.module.css';

export function LeaderCard({ leader }: { leader: RankedPlayerStanding }) {
  return (
    <div className={styles.card} data-variant="leader">
      <p className={styles.label}>Current leader</p>
      <p className={styles.value}>
        <span className={styles.primary}>{leader.id}</span>
        <span className={styles.meta}>{leader.totalPoints} pts</span>
      </p>
      <p className={styles.detail}>
        {leader.teams.join(' · ')}
      </p>
    </div>
  );
}
