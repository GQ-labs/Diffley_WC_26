# Diffley Lab — World Cup 2026 Points Tracker

A browser-based leaderboard for the Diffley lab World Cup pool. Each person owns three teams; points are calculated automatically from match results.

**Live site:** https://gq-labs.github.io/Diffley_WC_26/

**Design:** Simple and sleek. No emojis. Icons are inline SVG only; country flags via `TeamFlag`.

---

## For lab members

1. Open **https://gq-labs.github.io/Diffley_WC_26/**
2. Bookmark it on your phone or desktop.
3. Check the **Leaderboard** after matches — scores refresh on page load and via **Refresh** in the header.

No install, login, or technical setup required.

### Tabs

| Tab | What you see |
|-----|----------------|
| **Leaderboard** | Player rankings, upcoming matches, live current match, three latest results |
| **Groups** | Standings for Groups A–L; qualification badges; expand a row for match history |
| **Knockout stage** | Live projected bracket (phone: round-by-round list; desktop: compact tree with flag + code + owner) |
| **Fixtures** | Full schedule and results; click a row to open the match on FIFA.com |
| **Rules** | Scoring explained in plain English |

### Filter by player

Use **Show player** on Leaderboard, Groups, or Fixtures. The choice is shared across tabs and saved in the URL:

`https://gq-labs.github.io/Diffley_WC_26/?player=sam`

Use the `id` slug from `data/draft.json` (e.g. `sam`, `florian`, `john`).

The **Knockout stage** tab always shows the full tournament bracket with lab member names on every team.

### FIFA links

- Team names link to official FIFA team pages.
- Fixture rows, recent results, upcoming matches, knockout matches, and the live match card link to FIFA match pages where available.

---

## For the admin

### Local development

Requires **Node.js 20+** (install via [nodejs.org](https://nodejs.org), Homebrew, or `conda install -c conda-forge nodejs`).

```bash
npm install
npm run dev
```

Open http://localhost:5173 — stop the dev server with **Ctrl+C**.

### Build and QA

```bash
npm run build
npm run preview          # local preview (dev base path)
npm run preview:pages    # preview exactly as on GitHub Pages
npm run qa               # validate + test + typecheck + build
```

### Deploy (GitHub Pages)

**Live URL:** https://gq-labs.github.io/Diffley_WC_26/  
**Repo:** https://github.com/GQ-labs/Diffley_WC_26

Deploy is automatic: push to `main` runs `.github/workflows/deploy.yml` and publishes `dist/`.

**Manual redeploy:** GitHub → Actions → Deploy to GitHub Pages → Run workflow.

**If you rename the repo:** update `base` in `vite.config.ts` and push.

### Updating player teams

Edit `data/draft.json` — each player has an `id` (URL slug), `name` (nickname shown in the app), and three `teams`. Push to `main`; the site redeploys automatically.

Run `npm run validate` to check constraints (16 players, 48 unique teams, canonical names).

### Updating scoring rules

Edit `data/scoring.json`. Match points, knockout progression bonuses, and Rules tab copy are config-driven.

### Manual result overrides

If openfootball is wrong or slow, edit `data/overrides.json` and redeploy:

```json
{
  "matches": [
    {
      "id": "m73",
      "homeScore": 2,
      "awayScore": 1,
      "reason": "optional note for yourself"
    }
  ]
}
```

Match `id` values appear in the Fixtures tab (e.g. `m73` for openfootball match num 73). You can also match by `team1` + `team2` or `num`.

### Refreshing FIFA link map

Team and match URLs are stored in `data/fifa.json`, generated from the FIFA API:

```bash
npm run build:fifa
```

Commit the updated `data/fifa.json` after running. Required when FIFA slugs change or before the tournament if the API adds knockout match IDs.

---

## Scoring rules

| Item | Points |
|------|--------|
| Win | 3 |
| Draw | 1 |
| Loss | 0 |
| Penalty shootout | Counts as draw (1 pt each); advancing team gets knockout milestone |

### Knockout progression bonus

**+1 each time a team advances to a new knockout round** (bonuses stack):

| Advance to | Bonus | Running total |
|------------|------:|----------------:|
| Round of 32 | +1 | 1 |
| Round of 16 | +1 | 2 |
| Quarter-final | +1 | 3 |
| Semi-final | +1 | 4 |
| Final | +1 | 5 |

Bonuses follow the **tournament bracket tree** (who actually advances).

- **Round of 32:** bonus is awarded only after all 72 group matches are complete **and** openfootball lists real team names in every R32 fixture (not placeholders like `2A`)
- **Later rounds:** decided from knockout match results in the bracket
- **During groups:** knockout bonuses stay 0 until R32 is confirmed on the server
- **Winner:** no extra bonus beyond reaching the final (the final win is rewarded via match points)

**Player total** = sum of all three teams' match points + progression bonuses.

---

## Project structure

```
data/
  draft.json            # Players (nicknames) and team assignments
  scoring.json          # Scoring rules and rules-page copy
  team-aliases.json     # API / FIFA name → canonical team name
  overrides.json        # Manual score corrections
  fifa.json             # FIFA.com team + match URLs (generated)
scripts/
  validate-draft.mjs    # draft.json checks
  build-fifa-links.mjs  # Regenerate data/fifa.json from FIFA API
src/
  components/           # UI (tabs, tables, cards, flags, bracket)
  context/              # TournamentProvider — fetch, cache, live polling
  lib/                  # Scoring, groups, bracket, FIFA links, fixtures
  styles/               # Design tokens and global CSS
  types/                # TypeScript types
docs/
  design.md             # Visual design guidelines
  wireframes.md         # Screen-by-screen UI reference
AGENT.md                # Guide for AI agents / future maintainers
.github/workflows/
  deploy.yml            # GitHub Pages CI deploy
```

---

## Tech stack

- Vite + React + TypeScript
- Static JSON config (no backend)
- Match data: [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)
- Live scores: FIFA public calendar API (polled during live matches)
- Hosting: GitHub Pages

---

## Status

Feature-complete for WC 2026. Includes group standings, live projected knockout bracket, and bracket-based milestone scoring. Ongoing maintenance: `npm run qa` before pushes, `npm run build:fifa` if FIFA URLs need refreshing.

---

## Original source files

- `World Cup 26.docx` — draft order and team assignments
- `Diffley_WC_2026.xlsx` — early manual spreadsheet (superseded by this app)

---

## License

Internal lab use. Match data courtesy of the openfootball project (public domain).
