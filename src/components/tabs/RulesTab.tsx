import { scoringConfig } from '../../config';
import { PageHeader } from '../layout/TabNav';
import styles from './RulesTab.module.css';

const { rulesText, match, knockoutMilestone } = scoringConfig;

const milestoneRows = [
  { round: 'Eliminated in groups', points: knockoutMilestone.groupExit },
  { round: 'Round of 32', points: knockoutMilestone.roundOf32 },
  { round: 'Round of 16', points: knockoutMilestone.roundOf16 },
  { round: 'Quarter-final', points: knockoutMilestone.quarterFinal },
  { round: 'Semi-final', points: knockoutMilestone.semiFinal },
  { round: 'Final (runner-up)', points: knockoutMilestone.final },
  { round: 'Winner', points: knockoutMilestone.winner },
];

export function RulesTab() {
  return (
    <section aria-labelledby="rules-heading">
      <PageHeader
        id="rules-heading"
        title="Scoring rules"
        description="How points are calculated for the lab pool."
      />

      <div className={styles.content}>
        <article className={styles.block}>
          <h3 className={styles.heading}>Overview</h3>
          <p className={styles.text}>{rulesText.summary}</p>
        </article>

        <article className={styles.block}>
          <h3 className={styles.heading}>Match points</h3>
          <p className={styles.text}>{rulesText.matchPoints}</p>
          <ul className={styles.list}>
            <li>Win — {match.win} pts</li>
            <li>Draw — {match.draw} pt</li>
            <li>Loss — {match.loss} pts</li>
          </ul>
        </article>

        <article className={styles.block}>
          <h3 className={styles.heading}>Penalties</h3>
          <p className={styles.text}>{rulesText.penalties}</p>
        </article>

        <article className={styles.block}>
          <h3 className={styles.heading}>Knockout milestone bonus</h3>
          <p className={styles.text}>{rulesText.milestone}</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Furthest round</th>
                <th scope="col">Bonus</th>
              </tr>
            </thead>
            <tbody>
              {milestoneRows.map((row) => (
                <tr key={row.round}>
                  <td>{row.round}</td>
                  <td>+{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className={styles.block}>
          <h3 className={styles.heading}>Your total</h3>
          <p className={styles.text}>{rulesText.playerTotal}</p>
        </article>
      </div>
    </section>
  );
}
