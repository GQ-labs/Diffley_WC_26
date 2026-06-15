# Diffley Lab — World Cup 2026 Points Tracker

A simple, browser-based leaderboard for the Diffley lab World Cup pool. Each person owns three teams; points are calculated automatically from match results.

**Live site:** https://gq-labs.github.io/Diffley_WC_26/

**Design:** Simple and sleek. No emojis. Icons are inline SVG only.

---

## For lab members

1. Open **https://gq-labs.github.io/Diffley_WC_26/**
2. Bookmark it on your phone or desktop.
3. Check the **Leaderboard** tab after matches — scores update when results are refreshed (automatic on page load; admin can use **Refresh**).

No install, login, or technical setup required.

**Filter to one player:** add `?player=florian` to the URL (use the `id` slug from `draft.json`).

---

## For the admin

### Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

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

**One-time setup (already done):**

1. Repo `GQ-labs/Diffley_WC_26` on GitHub
2. Settings → Pages → Source: **GitHub Actions**
3. Workflow deploys on every push to `main`

**Manual redeploy:** GitHub → Actions → Deploy to GitHub Pages → Run workflow.

**If you rename the repo:** update `repoBase` in `vite.config.ts` to `/<repo-name>/` and push.

### Updating player teams

Edit `data/draft.json` — each player has an `id` (URL slug), `name` (nickname shown in the app), and three `teams`. Push to GitHub; the site redeploys automatically.

### Updating scoring rules

Edit `data/scoring.json`. Match points and knockout progression bonuses are config-driven.

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

Bonuses use **openfootball knockout fixtures only** — we do not compute group tables.

- A team earns +1 when they are slotted into a round or win through to the next
- **During groups:** knockout bonus stays 0 until the R32 bracket is filled in
- **Winner:** no extra bonus beyond reaching the final (the final win is rewarded via match points)

**Player total** = sum of all three teams' match points + progression bonuses.

---

## Project structure

```
data/
  draft.json          # Players and team assignments
  scoring.json        # Scoring rules and rules-page copy
  team-aliases.json   # API name → canonical team name
  overrides.json      # Manual score corrections (Phase 4)
src/
  components/         # UI components
  lib/                # Points engine (Phase 1)
  styles/             # Design tokens and global CSS
  types/              # TypeScript types
docs/
  design.md           # Visual design guidelines
AGENT.md              # Guide for AI agents / future maintainers
.github/workflows/
  deploy.yml          # GitHub Pages CI deploy
```

---

## Tech stack

- Vite + React + TypeScript
- Static JSON config (no backend)
- Match data: [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)
- Hosting: GitHub Pages (https://gq-labs.github.io/Diffley_WC_26/)

---

## Build phases

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | Done | Foundation, config, design tokens |
| 1 | Done | Points engine + tests |
| 2 | Done | UX wireframes + tab shell |
| 3 | Done | Real data wired to scoring engine |
| 4 | Done | Cache, fetch hardening, manual overrides |
| 5 | Done | Polish — leader card, latest result, refresh spin |
| 6 | Done | Mobile + accessibility |
| 7 | Done | QA |
| 8 | Done | GitHub Pages deploy — live at gq-labs.github.io/Diffley_WC_26 |

---

## Original source files

- `World Cup 26.docx` — draft order and team assignments
- `Diffley_WC_2026.xlsx` — early manual spreadsheet (superseded by this app)

---

## License

Internal lab use. Match data courtesy of the openfootball project (public domain).
