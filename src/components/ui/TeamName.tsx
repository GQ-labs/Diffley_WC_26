import type { MouseEvent, ReactNode } from 'react';
import { getTeamOwner, teamBelongsToPlayer, type TeamOwnerMap } from '../../lib/draftUtils';
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

interface TeamNameWithOwnerProps extends TeamNameProps {
  owner?: string;
  align?: 'start' | 'end';
  highlight?: boolean;
}

export function TeamNameWithOwner({
  team,
  owner,
  align = 'start',
  highlight = false,
  className,
  ...teamNameProps
}: TeamNameWithOwnerProps) {
  const alignClass = align === 'end' ? ` ${styles.teamWithOwnerEnd}` : '';
  const highlightClass = highlight ? ` ${styles.teamWithOwnerHighlight}` : '';
  return (
    <span
      className={`${styles.teamWithOwner}${alignClass}${highlightClass}${className ? ` ${className}` : ''}`}
    >
      <TeamName team={team} {...teamNameProps} />
      {owner ? (
        <span
          className={`${styles.owner}${highlight ? ` ${styles.ownerHighlight}` : ''}`}
        >
          {owner}
        </span>
      ) : null}
    </span>
  );
}

interface FixtureMatchupWithOwnersProps {
  team1: string;
  score: string;
  team2: string;
  owners: TeamOwnerMap;
  className?: string;
  date?: string;
  /** When set, teams owned by this player get accent highlight on the owner subline. */
  highlightPlayerTeams?: Set<string>;
}

const EMPTY_PLAYER_TEAMS = new Set<string>();

export function FixtureMatchupWithOwners({
  team1,
  score,
  team2,
  owners,
  className,
  date,
  highlightPlayerTeams = EMPTY_PLAYER_TEAMS,
}: FixtureMatchupWithOwnersProps) {
  const team1Owner = getTeamOwner(team1, owners);
  const team2Owner = getTeamOwner(team2, owners);
  const team1Highlight = teamBelongsToPlayer(team1, highlightPlayerTeams);
  const team2Highlight = teamBelongsToPlayer(team2, highlightPlayerTeams);

  const matchup = (
    <span
      className={`${styles.matchupWithOwners}${className ? ` ${className}` : ''}`}
    >
      <TeamNameWithOwner
        team={team1}
        owner={team1Owner}
        link={!date}
        align="start"
        highlight={team1Highlight}
      />
      <span className={styles.score}>{score}</span>
      <TeamNameWithOwner
        team={team2}
        owner={team2Owner}
        link={!date}
        align="end"
        highlight={team2Highlight}
      />
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
