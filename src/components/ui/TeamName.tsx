import type { ReactNode } from 'react';
import { TeamFlag } from './TeamFlag';
import styles from './TeamName.module.css';

interface TeamNameProps {
  team: string;
  className?: string;
  strong?: boolean;
}

export function TeamName({ team, className, strong }: TeamNameProps) {
  const label = strong ? <strong>{team}</strong> : <span>{team}</span>;

  return (
    <span className={`${styles.teamName}${className ? ` ${className}` : ''}`}>
      <TeamFlag team={team} />
      {label}
    </span>
  );
}

interface TeamNameListProps {
  teams: string[];
  separator?: ReactNode;
  className?: string;
}

export function TeamNameList({
  teams,
  separator = ', ',
  className,
}: TeamNameListProps) {
  return (
    <span className={className}>
      {teams.map((team, index) => (
        <span key={team} className={styles.listItem}>
          {index > 0 && <span className={styles.separator}>{separator}</span>}
          <TeamName team={team} />
        </span>
      ))}
    </span>
  );
}

interface FixtureMatchupProps {
  team1: string;
  score: string;
  team2: string;
  className?: string;
}

export function FixtureMatchup({
  team1,
  score,
  team2,
  className,
}: FixtureMatchupProps) {
  return (
    <span className={`${styles.matchup}${className ? ` ${className}` : ''}`}>
      <TeamName team={team1} />
      <span className={styles.score}>{score}</span>
      <TeamName team={team2} />
    </span>
  );
}
