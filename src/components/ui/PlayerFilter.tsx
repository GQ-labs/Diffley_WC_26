import { draftConfig } from '../../config';
import styles from './PlayerFilter.module.css';

interface PlayerFilterProps {
  value: string;
  onChange: (playerId: string) => void;
}

export function PlayerFilter({ value, onChange }: PlayerFilterProps) {
  return (
    <label className={styles.label}>
      <span className={styles.labelText}>Show player</span>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All players</option>
        {draftConfig.players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}
