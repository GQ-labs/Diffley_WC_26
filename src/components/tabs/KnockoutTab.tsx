import { useMemo } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { buildBracketTree, type BracketMatch } from '../../lib/bracket';
import { useTeamOwners } from '../../hooks/useTeamOwners';
import { getFifaMatchUrl } from '../../lib/fifa';
import { PageHeader } from '../layout/TabNav';
import { BracketMatchup } from '../ui/BracketMatchup';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/StatusMessage';
import { FixtureMatchupWithOwners } from '../ui/TeamName';
import styles from './KnockoutTab.module.css';

const LEFT_R32 = [73, 74, 75, 76, 77, 78, 79, 80];
const RIGHT_R32 = [81, 82, 83, 84, 85, 86, 87, 88];
const LEFT_R16 = [89, 90, 91, 92];
const RIGHT_R16 = [93, 94, 95, 96];
const LEFT_QF = [97, 99];
const RIGHT_QF = [98, 100];

const ROUND_SECTIONS: Array<{ id: string; label: string; nums: number[] }> = [
  {
    id: 'r32',
    label: 'Round of 32',
    nums: [
      73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88,
    ],
  },
  { id: 'r16', label: 'Round of 16', nums: [89, 90, 91, 92, 93, 94, 95, 96] },
  { id: 'qf', label: 'Quarter-final', nums: [97, 98, 99, 100] },
  { id: 'sf', label: 'Semi-final', nums: [101, 102] },
  { id: 'third', label: 'Match for third place', nums: [103] },
  { id: 'final', label: 'Final', nums: [104] },
];

export function KnockoutTab() {
  const { loading, error, matches, refresh } = useTournament();
  const owners = useTeamOwners();

  const bracket = useMemo(() => buildBracketTree(matches), [matches]);

  const byNum = useMemo(() => {
    const map = new Map<number, BracketMatch>();
    for (const match of [
      ...bracket.roundOf32,
      ...bracket.roundOf16,
      ...bracket.quarterFinals,
      ...bracket.semiFinals,
      ...(bracket.thirdPlace ? [bracket.thirdPlace] : []),
      ...(bracket.final ? [bracket.final] : []),
    ]) {
      map.set(match.num, match);
    }
    return map;
  }, [bracket]);

  if (loading && matches.length === 0) return <LoadingState />;
  if (error && matches.length === 0) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <section aria-labelledby="knockout-heading">
      <PageHeader
        id="knockout-heading"
        title="Knockout stage"
        description={
          bracket.projected
            ? 'Live projected bracket from current group standings and results.'
            : 'Confirmed knockout bracket from tournament results.'
        }
      />

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotProjected}`} />
          Projected slot
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotFinal}`} />
          Result in
        </span>
      </div>

      <div className={styles.mobileRounds}>
        {ROUND_SECTIONS.map((section) => {
          const sectionMatches = section.nums
            .map((num) => byNum.get(num))
            .filter((match): match is BracketMatch => match !== undefined);
          if (sectionMatches.length === 0) return null;

          return (
            <section
              key={section.id}
              className={styles.roundSection}
              aria-labelledby={`knockout-${section.id}`}
            >
              <h3 id={`knockout-${section.id}`} className={styles.roundTitle}>
                {section.label}
              </h3>
              <ul className={styles.roundList}>
                {sectionMatches.map((match) => (
                  <li key={match.num}>
                    <BracketMatchCard
                      match={match}
                      owners={owners}
                      variant="full"
                      featured={match.round === 'final'}
                      subdued={match.round === 'thirdPlace'}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className={styles.desktopBracket}>
        <p className={styles.scrollHint}>Swipe sideways for the full bracket</p>
        <div className={styles.bracketScroll}>
          <div className={styles.bracket}>
            <BracketColumn
              label="Round of 32"
              matchNums={LEFT_R32}
              byNum={byNum}
              owners={owners}
            />
            <BracketColumn
              label="Round of 16"
              matchNums={LEFT_R16}
              byNum={byNum}
              owners={owners}
            />
            <BracketColumn
              label="Quarter-final"
              matchNums={LEFT_QF}
              byNum={byNum}
              owners={owners}
            />
            <div className={styles.centerColumn}>
              <BracketColumn
                label="Semi-final"
                matchNums={[101]}
                byNum={byNum}
                owners={owners}
                compact
              />
              {bracket.final && (
                <BracketMatchCard
                  match={bracket.final}
                  owners={owners}
                  variant="compact"
                  featured
                />
              )}
              {bracket.thirdPlace && (
                <BracketMatchCard
                  match={bracket.thirdPlace}
                  owners={owners}
                  variant="compact"
                  subdued
                />
              )}
              <BracketColumn
                label="Semi-final"
                matchNums={[102]}
                byNum={byNum}
                owners={owners}
                compact
              />
            </div>
            <BracketColumn
              label="Quarter-final"
              matchNums={RIGHT_QF}
              byNum={byNum}
              owners={owners}
              alignEnd
            />
            <BracketColumn
              label="Round of 16"
              matchNums={RIGHT_R16}
              byNum={byNum}
              owners={owners}
              alignEnd
            />
            <BracketColumn
              label="Round of 32"
              matchNums={RIGHT_R32}
              byNum={byNum}
              owners={owners}
              alignEnd
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BracketColumn({
  label,
  matchNums,
  byNum,
  owners,
  alignEnd = false,
  compact = false,
}: {
  label: string;
  matchNums: number[];
  byNum: Map<number, BracketMatch>;
  owners: ReturnType<typeof useTeamOwners>;
  alignEnd?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`${styles.column} ${alignEnd ? styles.columnEnd : ''} ${
        compact ? styles.columnCompact : ''
      }`}
    >
      <p className={styles.columnLabel}>{label}</p>
      <div className={styles.columnMatches}>
        {matchNums.map((num) => {
          const match = byNum.get(num);
          if (!match) return null;
          return (
            <BracketMatchCard
              key={num}
              match={match}
              owners={owners}
              variant="compact"
            />
          );
        })}
      </div>
    </div>
  );
}

function BracketMatchCard({
  match,
  owners,
  variant,
  featured = false,
  subdued = false,
}: {
  match: BracketMatch;
  owners: ReturnType<typeof useTeamOwners>;
  variant: 'compact' | 'full';
  featured?: boolean;
  subdued?: boolean;
}) {
  const score =
    match.homeScore !== null && match.awayScore !== null
      ? `${match.homeScore}–${match.awayScore}`
      : 'vs';
  const url =
    match.date && match.team1 !== 'TBD' && match.team2 !== 'TBD'
      ? getFifaMatchUrl(match.date, match.team1, match.team2)
      : undefined;

  const card = (
    <article
      className={`${styles.matchCard} ${variant === 'full' ? styles.matchCardFull : ''} ${
        featured ? styles.matchFeatured : ''
      } ${subdued ? styles.matchSubdued : ''} ${
        match.projected ? styles.matchProjected : ''
      }`}
      aria-label={`${match.roundLabel} match ${match.num}, ${match.team1} ${score} ${match.team2}`}
    >
      <div className={styles.matchMeta}>
        <span>M{match.num}</span>
        <span className={styles.matchMetaRight}>
          {match.projected ? (
            <span className={styles.projectedTag}>proj.</span>
          ) : null}
          {match.roundLabel !== 'Round of 32' &&
          match.roundLabel !== 'Round of 16' &&
          variant === 'full' ? (
            <span className={styles.roundPill}>{match.roundLabel}</span>
          ) : null}
        </span>
      </div>
      {variant === 'compact' ? (
        <BracketMatchup
          team1={match.team1}
          score={score}
          team2={match.team2}
          owners={owners}
        />
      ) : (
        <FixtureMatchupWithOwners
          team1={match.team1}
          score={score}
          team2={match.team2}
          owners={owners}
        />
      )}
    </article>
  );

  if (!url) return card;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.matchLink}
      aria-label={`${match.team1} vs ${match.team2} on FIFA.com`}
    >
      {card}
    </a>
  );
}
