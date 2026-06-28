/**
 * Writes data/third-place-annex-c.json from scripts/thirdPlaceAssignments.mjs.
 * Run: node scripts/build-third-place-annex.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ANNEX_C_ROWS, ANNEX_C_WINNERS } from './thirdPlaceAssignments.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'data', 'third-place-annex-c.json');

if (ANNEX_C_ROWS.length !== 495) {
  throw new Error(`Expected 495 Annex C rows, got ${ANNEX_C_ROWS.length}`);
}

writeFileSync(
  out,
  JSON.stringify({ winners: ANNEX_C_WINNERS, rows: ANNEX_C_ROWS }),
);

console.log(`Wrote ${ANNEX_C_ROWS.length} rows to ${out}`);
