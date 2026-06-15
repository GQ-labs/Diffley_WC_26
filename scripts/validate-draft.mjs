#!/usr/bin/env node
/**
 * Validates data/draft.json structure. Run: node scripts/validate-draft.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const draft = JSON.parse(readFileSync(join(root, '../data/draft.json'), 'utf8'));
const aliases = JSON.parse(
  readFileSync(join(root, '../data/team-aliases.json'), 'utf8'),
);

const errors = [];
const players = draft.players ?? [];

if (players.length !== 16) {
  errors.push(`Expected 16 players, got ${players.length}`);
}

const allTeams = [];
for (const p of players) {
  if (!p.id || typeof p.id !== 'string') {
    errors.push(`Player missing id: ${JSON.stringify(p)}`);
  }
  if (!p.name || typeof p.name !== 'string') {
    errors.push(`Player ${p.id ?? '?'} missing name`);
  }
  if (!Array.isArray(p.teams) || p.teams.length !== 3) {
    errors.push(`Player ${p.id} must have exactly 3 teams`);
  } else {
    allTeams.push(...p.teams);
  }
}

const canonical = new Set(aliases.canonicalTeams);
for (const team of allTeams) {
  if (!canonical.has(team)) {
    errors.push(`Unknown team "${team}" — add to team-aliases.json canonicalTeams`);
  }
}

const unique = new Set(allTeams);
if (unique.size !== allTeams.length) {
  errors.push(`Duplicate teams in pool: expected 48 unique, got ${unique.size}`);
}
if (allTeams.length !== 48) {
  errors.push(`Expected 48 team slots, got ${allTeams.length}`);
}

if (errors.length) {
  console.error('draft.json validation FAILED:\n');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('draft.json validation OK');
console.log(`  ${players.length} players, ${unique.size} unique teams`);
