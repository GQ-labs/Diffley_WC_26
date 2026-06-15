/**
 * Fetches FIFA World Cup 2026 match IDs and team slugs, writes data/fifa.json.
 * Run: node scripts/build-fifa-links.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const FIFA_COMPETITION = '17';
const FIFA_SEASON = '285023';
const FIFA_STAGE = '289273';
const FIFA_MATCH_BASE = `https://www.fifa.com/en/match-centre/match/${FIFA_COMPETITION}/${FIFA_SEASON}/${FIFA_STAGE}`;
const FIFA_TEAM_BASE =
  'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams';
const FIFA_FIXTURES =
  'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/fixtures';

const teamAliases = JSON.parse(
  readFileSync(join(root, 'data/team-aliases.json'), 'utf8'),
).aliases;

/** FIFA display name -> canonical app team name */
const FIFA_NAME_TO_CANONICAL = {
  'Côte d\'Ivoire': 'Ivory Coast',
  'Cote d\'Ivoire': 'Ivory Coast',
  'Korea Republic': 'Korea',
  'South Korea': 'Korea',
  'United States': 'USA',
  'Czech Republic': 'Czechia',
  'Curaçao': 'Curacao',
  'Bosnia and Herzegovina': 'Bosnia',
  'DR Congo': 'Congo',
  'Cape Verde Islands': 'Cape Verde',
  'IR Iran': 'Iran',
};

/** Canonical team -> FIFA URL slug (verified on fifa.com) */
const TEAM_SLUG_OVERRIDES = {
  Bosnia: 'bosnia-and-herzegovina',
  Congo: 'congo-dr',
  Curacao: 'curacao',
  'Ivory Coast': 'cote-divoire',
  Korea: 'korea-republic',
  USA: 'united-states',
};

function normalizeTeam(name) {
  const trimmed = name.trim();
  return (
    FIFA_NAME_TO_CANONICAL[trimmed] ??
    teamAliases[trimmed] ??
    trimmed
  );
}

function fifaTeamLabel(team) {
  return team?.TeamName?.find((x) => x.Locale === 'en-GB')?.Description
    ?? team?.TeamName?.[0]?.Description
    ?? '';
}

function matchLookupKey(date, team1, team2) {
  const day = date.slice(0, 10);
  const pair = [normalizeTeam(team1), normalizeTeam(team2)].sort();
  return `${day}|${pair[0]}|${pair[1]}`;
}

function defaultSlug(canonical) {
  return canonical
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function slugCandidates(canonical, fifaDisplayName) {
  const candidates = new Set();
  if (TEAM_SLUG_OVERRIDES[canonical]) {
    candidates.add(TEAM_SLUG_OVERRIDES[canonical]);
  }
  candidates.add(defaultSlug(canonical));
  if (fifaDisplayName) {
    candidates.add(defaultSlug(fifaDisplayName));
  }
  return [...candidates];
}

async function resolveTeamSlug(canonical, fifaDisplayName) {
  for (const slug of slugCandidates(canonical, fifaDisplayName)) {
    const url = `${FIFA_TEAM_BASE}/${slug}/team-news`;
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.ok) return slug;
  }
  throw new Error(`No FIFA slug for ${canonical} (${fifaDisplayName})`);
}

async function main() {
  const res = await fetch(
    `https://api.fifa.com/api/v3/calendar/matches?count=500&idSeason=${FIFA_SEASON}&idCompetition=${FIFA_COMPETITION}`,
    { headers: { Accept: 'application/json' } },
  );
  if (!res.ok) throw new Error(`FIFA API ${res.status}`);
  const data = await res.json();
  const results = data.Results ?? [];

  const matches = {};
  const fifaDisplayByCanonical = {};

  for (const m of results) {
    const homeLabel = fifaTeamLabel(m.Home);
    const awayLabel = fifaTeamLabel(m.Away);
    const home = normalizeTeam(homeLabel);
    const away = normalizeTeam(awayLabel);
    const key = matchLookupKey(m.Date, homeLabel, awayLabel);
    matches[key] = `${FIFA_MATCH_BASE}/${m.IdMatch}`;
    if (home) fifaDisplayByCanonical[home] = homeLabel;
    if (away) fifaDisplayByCanonical[away] = awayLabel;
  }

  const teams = {};
  const canonicalNames = Object.keys(fifaDisplayByCanonical).sort();
  for (const canonical of canonicalNames) {
    const slug = await resolveTeamSlug(
      canonical,
      fifaDisplayByCanonical[canonical],
    );
    teams[canonical] = `${FIFA_TEAM_BASE}/${slug}/team-news`;
  }

  const out = {
    meta: {
      source: 'FIFA API v3 calendar/matches',
      generated: new Date().toISOString().slice(0, 10),
      competitionId: FIFA_COMPETITION,
      seasonId: FIFA_SEASON,
      stageId: FIFA_STAGE,
      fixturesFallback: FIFA_FIXTURES,
    },
    teams,
    matches,
  };

  const outPath = join(root, 'data/fifa.json');
  writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`Wrote ${outPath}`);
  console.log(`  ${Object.keys(teams).length} teams, ${Object.keys(matches).length} matches`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
