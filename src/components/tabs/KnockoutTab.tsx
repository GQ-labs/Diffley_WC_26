import { useMemo } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  bracketMatchShowsFeederPaths,
  buildBracketTree,
  formatFeederSlot,
  getBracketFeederTemplate,
  type BracketMatch,
  type BracketTree,
} from '../../lib/bracket';
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
            <CenterBracketColumn
              byNum={byNum}
              owners={owners}
              bracket={bracket}
            />
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
}: {
  label: string;
  matchNums: number[];
  byNum: Map<number, BracketMatch>;
  owners: ReturnType<typeof useTeamOwners>;
  alignEnd?: boolean;
}) {
  return (
    <div className={`${styles.column} ${alignEnd ? styles.columnEnd : ''}`}>
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
              layout="compact"
            />
          );
        })}
      </div>
    </div>
  );
}

function CenterBracketColumn({
  byNum,
  owners,
  bracket,
}: {
  byNum: Map<number, BracketMatch>;
  owners: ReturnType<typeof useTeamOwners>;
  bracket: BracketTree;
}) {
  const slots: Array<{
    match: BracketMatch;
    featured?: boolean;
    subdued?: boolean;
  }> = [];

  const sf101 = byNum.get(101);
  const sf102 = byNum.get(102);
  if (sf101) slots.push({ match: sf101 });
  if (bracket.final) slots.push({ match: bracket.final, featured: true });
  if (bracket.thirdPlace) {
    slots.push({ match: bracket.thirdPlace, subdued: true });
  }
  if (sf102) slots.push({ match: sf102 });

  return (
    <div className={styles.column}>
      <p className={styles.columnLabel}>Semi-final</p>
      <div className={styles.columnMatches}>
        {slots.map(({ match, featured, subdued }) => (
          <BracketMatchCard
            key={match.num}
            match={match}
            owners={owners}
            layout="compact"
            featured={featured}
            subdued={subdued}
          />
        ))}
      </div>
    </div>
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
}: {
  match: BracketMatch;
  owners: ReturnType<typeof useTeamOwners>;
  layout: 'list' | 'compact';
  featured?: boolean;
  subdued?: boolean;
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
    >
      {card}
    </a>
  );
}
