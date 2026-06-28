import { useMemo, useRef } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  bracketMatchShowsFeederPaths,
  buildBracketTree,
  formatFeederSlot,
  getBracketFeederTemplate,
  type BracketMatch,
} from '../../lib/bracket';
import {
  BRACKET_COLUMN_INDEX,
  CENTER_ORDER,
  DESKTOP_COLUMN_LABELS,
  getBracketSlot,
  LEFT_QF_ORDER,
  LEFT_R16_ORDER,
  LEFT_R32_ORDER,
  LIST_R32_ORDER,
  RIGHT_QF_ORDER,
  RIGHT_R16_ORDER,
  RIGHT_R32_ORDER,
} from '../../lib/bracketLayout';
import { useTeamOwners } from '../../hooks/useTeamOwners';
import { getFifaMatchUrl } from '../../lib/fifa';
import { PageHeader } from '../layout/TabNav';
import { BracketMatchup } from '../ui/BracketMatchup';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/StatusMessage';
import { FixtureMatchupWithOwners } from '../ui/TeamName';
import { BracketConnectors } from './BracketConnectors';
import styles from './KnockoutTab.module.css';

const ROUND_SECTIONS: Array<{ id: string; label: string; nums: number[] }> = [
  {
    id: 'r32',
    label: 'Round of 32',
    nums: [...LIST_R32_ORDER],
  },
  { id: 'r16', label: 'Round of 16', nums: [89, 90, 91, 92, 93, 94, 95, 96] },
  { id: 'qf', label: 'Quarter-final', nums: [97, 98, 99, 100] },
  { id: 'sf', label: 'Semi-final', nums: [101, 102] },
  { id: 'third', label: 'Match for third place', nums: [103] },
  { id: 'final', label: 'Final', nums: [104] },
];

const DESKTOP_MATCH_ORDER = [
  ...LEFT_R32_ORDER,
  ...LEFT_R16_ORDER,
  ...LEFT_QF_ORDER,
  ...CENTER_ORDER,
  ...RIGHT_QF_ORDER,
  ...RIGHT_R16_ORDER,
  ...RIGHT_R32_ORDER,
] as const;

export function KnockoutTab() {
  const { loading, error, matches, refresh } = useTournament();
  const owners = useTeamOwners();
  const gridRef = useRef<HTMLDivElement>(null);

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

  const connectorKey = useMemo(
    () =>
      DESKTOP_MATCH_ORDER.map((num) => {
        const match = byNum.get(num);
        return `${num}:${match?.team1}:${match?.team2}:${match?.homeScore}`;
      }).join('|'),
    [byNum],
  );

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
            ? 'Round of 32 from current group standings. Later rounds show which match winners meet.'
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

      <div className={styles.listRounds}>
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
                      layout="list"
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
          <div className={styles.bracketHeaders}>
            {DESKTOP_COLUMN_LABELS.map(({ id, label }) => (
              <p key={id} className={styles.columnLabel}>
                {label}
              </p>
            ))}
          </div>
          <div className={styles.bracketGrid} ref={gridRef}>
            <BracketConnectors gridRef={gridRef} layoutKey={connectorKey} />
            {DESKTOP_MATCH_ORDER.map((num) => {
              const match = byNum.get(num);
              const slot = getBracketSlot(num);
              if (!match || !slot) return null;

              const column = BRACKET_COLUMN_INDEX[slot.column];
              const alignEnd =
                slot.column === 'r32-right' ||
                slot.column === 'r16-right' ||
                slot.column === 'qf-right';

              return (
                <div
                  key={num}
                  className={`${styles.matchSlot} ${alignEnd ? styles.matchSlotEnd : ''}`}
                  style={{ gridColumn: column, gridRow: slot.row }}
                >
                  <BracketMatchCard
                    match={match}
                    owners={owners}
                    layout="compact"
                    featured={match.round === 'final'}
                    subdued={match.round === 'thirdPlace'}
                    bracketAnchor
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeederPathMatchup({
  slot1,
  slot2,
  compact = false,
}: {
  slot1: string;
  slot2: string;
  compact?: boolean;
}) {
  const label1 = formatFeederSlot(slot1);
  const label2 = formatFeederSlot(slot2);

  return (
    <p
      className={`${styles.feederMatchup} ${compact ? styles.feederMatchupCompact : ''}`}
      aria-label={`${label1} vs ${label2}`}
    >
      <span className={styles.feederSlot}>{label1}</span>
      <span className={styles.feederVs}>vs</span>
      <span className={styles.feederSlot}>{label2}</span>
    </p>
  );
}

function BracketMatchCard({
  match,
  owners,
  layout,
  featured = false,
  subdued = false,
  bracketAnchor = false,
}: {
  match: BracketMatch;
  owners: ReturnType<typeof useTeamOwners>;
  layout: 'list' | 'compact';
  featured?: boolean;
  subdued?: boolean;
  bracketAnchor?: boolean;
}) {
  const score =
    match.homeScore !== null && match.awayScore !== null
      ? `${match.homeScore}–${match.awayScore}`
      : 'vs';
  const showFeeders = bracketMatchShowsFeederPaths(match);
  const feederTemplate = showFeeders ? getBracketFeederTemplate(match.num) : null;
  const compact = layout === 'compact';

  const url =
    !showFeeders &&
    match.date &&
    match.team1 !== 'TBD' &&
    match.team2 !== 'TBD'
      ? getFifaMatchUrl(match.date, match.team1, match.team2)
      : undefined;

  const matchupLabel = feederTemplate
    ? `${formatFeederSlot(feederTemplate.team1)} vs ${formatFeederSlot(feederTemplate.team2)}`
    : `${match.team1} ${score} ${match.team2}`;

  const card = (
    <article
      className={`${styles.matchCard} ${compact ? styles.matchCardCompact : ''} ${
        featured ? styles.matchFeatured : ''
      } ${subdued ? styles.matchSubdued : ''} ${
        match.projected && !showFeeders ? styles.matchProjected : ''
      }`}
      aria-label={`${match.roundLabel} match ${match.num}, ${matchupLabel}`}
      {...(bracketAnchor ? { 'data-bracket-match': match.num } : {})}
    >
      <div className={styles.matchMeta}>
        <span>M{match.num}</span>
        <span className={styles.matchMetaRight}>
          {showFeeders ? (
            <span className={styles.feederHint}>winner paths</span>
          ) : match.projected ? (
            <span className={styles.projectedTag}>proj.</span>
          ) : null}
          {!compact &&
          match.roundLabel !== 'Round of 32' &&
          match.roundLabel !== 'Round of 16' ? (
            <span className={styles.roundPill}>{match.roundLabel}</span>
          ) : null}
        </span>
      </div>
      {showFeeders && feederTemplate ? (
        <FeederPathMatchup
          slot1={feederTemplate.team1}
          slot2={feederTemplate.team2}
          compact={compact}
        />
      ) : compact ? (
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
      {...(bracketAnchor ? { 'data-bracket-match': match.num } : {})}
    >
      {card}
    </a>
  );
}
