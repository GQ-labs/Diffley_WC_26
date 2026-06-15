# AGENT.md — Maintainer guide for AI agents

This file helps future agents (or humans) work on the Diffley WC 26 points tracker without re-discovering context.

---

## What this project is

A **static React app** for a lab World Cup pool:

- 16 players (initials only), 3 teams each (48 teams total)
- Points from match results (3/1/0) + single knockout milestone bonus per team
- Results pulled from openfootball JSON; no backend, no database
- Deployed to **GitHub Pages** — https://gq-labs.github.io/Diffley_WC_26/
- Repo: https://github.com/GQ-labs/Diffley_WC_26

---

## Design principles (mandatory)

Read `docs/design.md` before changing UI.

Summary:

- **Simple and sleek** — minimal chrome, generous whitespace
- **Not playful or cluttered** — no gamification, confetti, loud colours
- **No emojis** anywhere (UI, copy, comments, commits)
- **Icons:** inline SVG components only (`src/components/icons/`), stroke-based, 24×24 viewBox
- **Typography:** Inter, system fallback
- **Colour:** neutral greys + one blue accent; respects `prefers-color-scheme`
- **Tables:** primary UI pattern for leaderboard and fixtures

Do not add UI libraries (MUI, Chakra, etc.) unless explicitly requested.

---

## Key files

| File | Purpose |
|------|---------|
| `data/draft.json` | Player initials + 3 teams each — **source of truth for assignments** |
| `data/scoring.json` | Match points, milestone bonuses, rules tab copy |
| `data/team-aliases.json` | Maps API team names to canonical names in draft |
| `data/overrides.json` | Manual score fixes when API is wrong |
| `src/config.ts` | Imports JSON config + results URL constant |
| `src/context/TournamentContext.tsx` | Fetches results, computes standings |
| `src/lib/results.ts` | Fetch + normalize openfootball JSON |
| `src/lib/fixtures.ts` | Fixture rows for UI |
| `src/lib/aggregate.ts` | Team/player totals (Phase 1) |
| `vite.config.ts` | `base` for GitHub Pages; `cacheDir` outside Dropbox (avoids EBUSY in dev) |

---

## Scoring logic (do not change without user approval)

### Match points

- Win = 3, Draw = 1, Loss = 0
- Knockout matches use same match points
- Penalty shootout: both teams get draw points (1); winner advances for milestone

### Knockout milestone

**Cumulative** — each tier adds to the running total when a team advances:

```
roundOf32: +2, roundOf16: +4, quarterFinal: +6, semiFinal: +8  (max 20)
```

- R32 (+2): canonical team name appears in a Round of 32 match
- Later stages: slotted into next-round fixture or won previous knockout tie
- Final / winner: no extra knockout bonus beyond semi-final tier

Never infer qualification from group results.

### Player total

Sum across all 3 teams: (sum of match points) + (milestone bonus each).

---

## Data validation rules

When editing `data/draft.json`:

- Exactly **16 players**
- Each player has exactly **3 teams**
- All **48 team names** unique across the pool
- Team names must match `canonicalTeams` in `team-aliases.json`

---

## External data

**Primary source:**  
`https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json`

- No API key
- CORS: works from browser for raw GitHub URLs
- Team names may differ from draft — always normalize via `team-aliases.json`

**Cache:** `localStorage` key `diffley-wc-26-matches-v1` (see `src/lib/cache.ts`). On load: show cache immediately if present, then fetch live. On fetch failure: keep cache and show warning banner.

**Overrides:** Edit `data/overrides.json`, redeploy. Applied in `src/lib/overrides.ts` after fetch. Match by `id`, `num`, or `team1`+`team2`.

---

## Phase checklist

Before marking a phase complete:

1. `npm run typecheck` passes
2. `npm run build` passes
3. No emojis introduced
4. README phase table updated
5. Scoring changes have unit tests

| Phase | Entry criteria |
|-------|----------------|
| 1 | `src/lib/scoring.test.ts` covers W/D/L, penalties, each milestone |
| 3 | Four tabs render with mock data |
| 4 | Refresh fetches JSON, handles failure gracefully |
| 7 | `npm run qa` passes; desktop + 375px browser check; real-device check after Phase 8 |
| 8 | GitHub Actions deploy workflow + Pages live on `main` |

---

## Common tasks

### Add a new player (unlikely)

1. Edit `data/draft.json`
2. Ensure team count constraints still hold (pool is fixed at 48 teams)
3. Rebuild and deploy

### Rename initials to full names

Add optional `name` field to player objects in `draft.json`; display `name ?? id` in UI. Keep initials as `id` for URLs.

### Fix wrong API team name

Add mapping in `data/team-aliases.json` under `aliases`.

### Change GitHub Pages URL

1. Rename repo on GitHub
2. Update `base` in `vite.config.ts`
3. Update `.github/workflows/deploy.yml` if present

---

## What not to do

- Do not add a backend or auth unless user requests
- Do not use emoji flags or emoji anywhere
- Do not use icon font packs — SVG only
- Do not commit secrets or `.env` files
- Do not skip Phase 1 tests when changing scoring

---

## Workspace context

- Parent monorepo: Antigravity (`../CLAUDE.md`)
- Global rule: **no emojis** in this workspace
- Original draft: `World Cup 26.docx` in project root
- User preference: GitHub Pages, simplest sharing for non-technical lab members

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server
npm run build        # Production build → dist/
npm run preview      # Preview production build (dev base)
npm run preview:pages  # Preview with GitHub Pages base path
npm run qa           # validate + test + typecheck + build
npm run test         # Run unit tests
npm run test:watch   # Watch mode
npm run validate     # Check draft.json
```

---

## Contact / ownership

Internal Diffley lab project.

**Git workflow:** The maintainer does not commit or push manually. Agents make changes locally, then `git add`, `commit`, and `push` to `main` when a task is complete (deploy is automatic via GitHub Actions).
