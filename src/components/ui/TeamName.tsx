import type { MouseEvent, ReactNode } from 'react';
import { getFifaMatchUrl, getFifaTeamUrl } from '../../lib/fifa';
import { TeamFlag } from './TeamFlag';
import styles from './TeamName.module.css';

interface TeamNameProps {
  team: string;
  className?: string;
  strong?: boolean;
  /** When false, team name is plain text (e.g. inside a match link). Default true. */
  link?: boolean;
}

function FifaLink({
  href,
  label,
  children,
  onClick,
}: {
  href: string;
  label: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
      aria-label={`${label} on FIFA.com`}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

export function TeamName({
  team,
  className,
  strong,
  link = true,
}: TeamNameProps) {
  const label = strong ? <strong>{team}</strong> : <span>{team}</span>;
  const content = (
    <span className={`${styles.teamName}${className ? ` ${className}` : ''}`}>
      <TeamFlag team={team} />
      {label}
    </span>
  );

  const href = link ? getFifaTeamUrl(team) : undefined;
  if (!href) return content;

  return (
    <FifaLink
      href={href}
      label={team}
      onClick={(event) => event.stopPropagation()}
    >
      {content}
    </FifaLink>
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
  date?: string;
}

export function FixtureMatchup({
  team1,
  score,
  team2,
  className,
  date,
}: FixtureMatchupProps) {
  const matchup = (
    <span className={`${styles.matchup}${className ? ` ${className}` : ''}`}>
      <TeamName team={team1} link={!date} />
      <span className={styles.score}>{score}</span>
      <TeamName team={team2} link={!date} />
    </span>
  );

  if (!date) return matchup;

  const matchHref = getFifaMatchUrl(date, team1, team2);
  if (!matchHref) return matchup;

  const matchLabel = `${team1} vs ${team2} on FIFA.com`;

  return (
    <FifaLink href={matchHref} label={matchLabel}>
      {matchup}
    </FifaLink>
  );
}
