import { scoringConfig } from '../../config';
import {
  KNOCKOUT_BONUS_STAGE_LABELS,
  KNOCKOUT_BONUS_STAGES,
} from '../../lib/milestones';
import { PageHeader } from '../layout/TabNav';
import styles from './RulesTab.module.css';

const { rulesText, match, knockoutMilestone } = scoringConfig;

const milestoneRows = KNOCKOUT_BONUS_STAGES.map((stage, index) => ({
  round: KNOCKOUT_BONUS_STAGE_LABELS[stage],
  bonus: knockoutMilestone[stage],
  runningTotal: KNOCKOUT_BONUS_STAGES.slice(0, index + 1).reduce(
    (sum, key) => sum + knockoutMilestone[key],
    0,
  ),
}));

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
          <h3 className={styles.heading}>Knockout progression bonus</h3>
          <p className={styles.text}>{rulesText.milestone}</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Advance to</th>
                <th scope="col">Bonus</th>
                <th scope="col">Running total</th>
              </tr>
            </thead>
            <tbody>
              {milestoneRows.map((row) => (
                <tr key={row.round}>
                  <td>{row.round}</td>
                  <td>+{row.bonus}</td>
                  <td>{row.runningTotal}</td>
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
