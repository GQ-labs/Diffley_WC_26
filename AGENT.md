# AGENT.md — Maintainer guide for AI agents

This file helps future agents (or humans) work on the Diffley WC 26 points tracker without re-discovering context.

---

## What this project is

A **static React app** for a lab World Cup pool:

- 16 players (nicknames), 3 teams each (48 teams total)
- Points from match results (3/1/0) + +1 per knockout round reached (stacking, max +5)
- Results from openfootball JSON; live match card from FIFA API
- No backend, no database
- Deployed to **GitHub Pages** — https://gq-labs.github.io/Diffley_WC_26/
- Repo: https://github.com/GQ-labs/Diffley_WC_26

**Git workflow:** The maintainer does not commit or push manually. Agents make changes locally, then `git add`, `commit`, and `push` to `main` when a task is complete (deploy is automatic via GitHub Actions).

---

## Design principles (mandatory)

Read `docs/design.md` before changing UI.

Summary:

- **Simple and sleek** — minimal chrome, generous whitespace
- **Not playful or cluttered** — no gamification, confetti, loud colours
- **No emojis** anywhere (UI, copy, comments, commits)
- **Icons:** inline SVG components only (`src/components/icons/`), stroke-based, 24×24 viewBox
- **Flags:** `TeamFlag` + `country-flag-icons`; custom SVG for England and Scotland
- **Typography:** Inter, system fallback
- **Colour:** neutral greys + one blue accent; respects `prefers-color-scheme`
- **Tables:** primary UI pattern for leaderboard, groups, fixtures, and knockout lists

Do not add UI libraries (MUI, Chakra, etc.) unless explicitly requested.

---

## Key files

| File | Purpose |
|------|---------|
| `data/draft.json` | Player nicknames + 3 teams each — **source of truth for assignments** |
| `data/scoring.json` | Match points, knockout bonuses, rules tab copy |
| `data/team-aliases.json` | Maps API/FIFA team names to canonical draft names |
| `data/fifa.json` | FIFA.com team + match URLs (`npm run build:fifa` to regenerate) |
| `data/overrides.json` | Manual score fixes when openfootball is wrong |
| `src/config.ts` | Imports JSON config + openfootball results URL |
| `src/context/TournamentContext.tsx` | Fetch, cache, standings, live match polling |
| `src/lib/results.ts` | Fetch + normalize openfootball JSON |
| `src/lib/scoring.ts` | Match points, team standings, normalization |
| `src/lib/groups.ts` | Group standings (A–L), third-place ranking, FIFA tiebreakers |
| `src/lib/bracket.ts` | Knockout bracket tree, R32 third-place assignment, projections |
| `src/lib/milestones.ts` | Knockout progression bonuses (bracket tree; R32 gated on server data) |
| `src/lib/aggregate.ts` | Player/team rankings |
| `src/lib/fixtures.ts` | Fixture rows for Fixtures tab |
| `src/lib/fifa.ts` | Resolve FIFA URLs from `data/fifa.json` |
| `src/lib/liveMatch.ts` | Current live match from FIFA API + kickoff window fallback |
| `src/lib/upcomingMatches.ts` | US matchday grouping, UK kickoff display |
| `src/lib/recentMatch.ts` | Latest completed results (up to 3) |
| `src/lib/draftUtils.ts` | Owner map, player team filter helpers |
| `vite.config.ts` | `base` for GitHub Pages; `cacheDir` outside Dropbox (avoids EBUSY in dev) |

---

## App features (current)

### Leaderboard tab

- Sortable player table with expandable per-team breakdown
- **Show player** filter (shared URL param `?player=`)
- **Upcoming matches** card — current US matchday, kickoffs in UK time, FIFA links
- **Current match** card — live score from FIFA API (30s poll); openfootball refresh every 45s while live
- **Latest results** — up to 3 recent finished matches, FIFA links

### Groups tab

- Twelve group tables (A–L) with live standings and pool points
- Expand row for W/D/L match history with FIFA links
- **Show player** filter — shows only that player's teams across groups

### Knockout stage tab

- **Narrow screens (<1024px):** round-by-round match list (R32 through final)
- **Desktop (1024px+):** horizontal column bracket (R32 | R16 | QF | centre | QF | R16 | R32); swipe to scroll on medium widths
- **Round of 32:** projected teams from group standings; full names + owner labels (list) or flag + code + owner (columns)
- **Round of 16 onward:** feeder paths only (e.g. M73 vs M75, Loser M101) until openfootball reports a final score with real team names
- No player filter — all teams shown with owner sublabels on R32

### Fixtures tab

- All matches; click row for FIFA match page
- **Show player** filter — matches involving that player's teams
- Refresh button in tab header

### Rules tab

- Copy from `data/scoring.json`

### URL state

- Tab: `#groups`, `#knockout`, `#fixtures`, `#rules` (leaderboard is default, no hash)
- Legacy `#teams` redirects to `#groups`
- Player filter: `?player=<id>` — persists across tabs (not used on Knockout stage)

---

## Scoring logic (do not change without user approval)

### Match points

- Win = 3, Draw = 1, Loss = 0
- Knockout matches use same match points
- Penalty shootout: both teams get draw points (1); winner advances for milestone

### Knockout progression bonus

**+1 per knockout round reached** (stacking):

```
roundOf32: +1, roundOf16: +1, quarterFinal: +1, semiFinal: +1, final: +1  (max +5)
```

Milestones use the **bracket tree** (`src/lib/bracket.ts` + `src/lib/milestones.ts`):

- **R32 bonus:** only after all 72 group matches are complete **and** every R32 fixture on openfootball lists real team names (no `1A` / `2B` / `3A/B/C` placeholders)
- **R16 onward:** team advanced by winning the previous knockout round (or reaching the next round in the tree from results)
- The Knockout stage tab projects **round of 32** slots from group tables; later rounds show **feeder match paths** (not projected countries). Milestone bonuses never use display projections

### Player total

Sum across all 3 teams: (match points) + (progression bonuses).

---

## Data validation rules

When editing `data/draft.json`:

- Exactly **16 players**
- Each player has exactly **3 teams**
- All **48 team names** unique across the pool
- Team names must match `canonicalTeams` in `team-aliases.json`

Run `npm run validate` after edits.

---

## External data

### openfootball (primary results)

`https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json`

- No API key; CORS works from browser
- Normalize team names via `team-aliases.json`
- Includes `date`, `time` (e.g. `20:00 UTC-6`), `score.ft`, knockout `num`

### FIFA API (live match + link map)

- Calendar: `api.fifa.com/api/v3/calendar/matches?idSeason=285023&idCompetition=17`
- `data/fifa.json` built by `scripts/build-fifa-links.mjs`
- Match lookup uses team-pair keys (not date alone) because openfootball dates are US local days and FIFA uses UTC
- Important alias: `Türkiye` → `Turkey`

### Cache

`localStorage` key `diffley-wc-26-matches-v1`. On load: show cache immediately if present, then fetch live. On failure: keep cache + warning banner.

### Overrides

`data/overrides.json` — applied after fetch. Match by `id`, `num`, or `team1`+`team2`.

---

## Maintenance checklist

Before pushing significant changes:

1. `npm run qa` passes (validate + 59 tests + typecheck + build)
2. No emojis introduced
3. Scoring changes include unit tests
4. `data/fifa.json` regenerated if FIFA mapping logic changed (`npm run build:fifa`)
5. README / AGENT / docs updated if behaviour or structure changed

---

## Common tasks

### Add or rename a player

1. Edit `data/draft.json` (`id`, `name`, `teams`)
2. `npm run validate`
3. Push to `main`

### Fix wrong API team name

Add mapping in `data/team-aliases.json` under `aliases`. Regenerate FIFA links if needed.

### Fix missing FIFA match link

1. Check `team-aliases.json` for FIFA display name (e.g. Türkiye)
2. `npm run build:fifa` and commit `data/fifa.json`

### Change GitHub Pages URL

1. Rename repo on GitHub
2. Update `base` in `vite.config.ts`
3. Push

---

## What not to do

- Do not add a backend or auth unless user requests
- Do not use emoji flags or emoji anywhere
- Do not use icon font packs — SVG only
- Do not commit secrets or `.env` files
- Do not skip scoring tests when changing points logic
- Do not award R32 milestone bonuses from projected group tables — wait for openfootball R32 confirmation

---

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run preview:pages
npm run qa
npm run test
npm run test:watch
npm run validate
npm run build:fifa
```

---

## Workspace context

- Parent monorepo: Antigravity (`../CLAUDE.md`)
- Global rule: **no emojis** in this workspace
- Original draft: `World Cup 26.docx` in project root

Internal Diffley lab project.
