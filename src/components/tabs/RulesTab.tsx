import { scoringConfig } from '../../config';
import { PageHeader } from '../layout/TabNav';
import styles from './RulesTab.module.css';

const { rulesText, match, knockoutMilestone } = scoringConfig;

const milestoneRows = [
  { round: 'Round of 32', bonus: knockoutMilestone.roundOf32 },
  { round: 'Round of 16', bonus: knockoutMilestone.roundOf16 },
  { round: 'Quarter-final', bonus: knockoutMilestone.quarterFinal },
  { round: 'Semi-final', bonus: knockoutMilestone.semiFinal },
].reduce<
  { round: string; bonus: number; runningTotal: number }[]
>((rows, row) => {
  const runningTotal = (rows[rows.length - 1]?.runningTotal ?? 0) + row.bonus;
  rows.push({ ...row, runningTotal });
  return rows;
}, []);

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
          <p className={styles.note}>
            Final and winner do not add extra knockout bonus beyond the semi-final
            tier. The table always shows how many bonus points a team has earned
            at their current stage.
          </p>
        </article>

        <article className={styles.block}>
          <h3 className={styles.heading}>Your total</h3>
          <p className={styles.text}>{rulesText.playerTotal}</p>
        </article>
      </div>
    </section>
  );
}
