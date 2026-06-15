# Diffley Lab — World Cup 2026 Points Tracker

A simple, browser-based leaderboard for the Diffley lab World Cup pool. Each person owns three teams; points are calculated automatically from match results.

**Design:** Simple and sleek. No emojis. Icons are inline SVG only.

---

## For lab members

1. Open the shared GitHub Pages URL (added after Phase 8 deploy).
2. Bookmark it on your phone or desktop.
3. Check the **Leaderboard** tab after matches — scores update when the admin refreshes results.

No install, login, or technical setup required.

---

## For the admin (Samson)

### Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Build

```bash
npm run build
npm run preview
npm run qa      # validate + test + typecheck + build
```

### Deploy to GitHub Pages

**One-time setup** (no repo exists yet):

1. **Create an empty repo on GitHub**
   - Go to [github.com/new](https://github.com/new)
   - Repository name: `Diffley_WC_26` (must match `base` in `vite.config.ts`)
   - Visibility: Public (required for free GitHub Pages) or Private if your org allows Pages on private repos
   - Do **not** add a README, `.gitignore`, or licence — you already have those locally

2. **Link this folder and push** (run in PowerShell from the project folder):

```powershell
cd "D:\The Francis Crick Dropbox\Samson Glaser\12. Antigravity\Diffley_WC_26"

git init
git add .
git commit -m "Initial commit: Diffley WC 26 points tracker"

git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/Diffley_WC_26.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub handle. GitHub may prompt you to sign in (browser or personal access token).

3. **Enable GitHub Pages**
   - Repo → **Settings** → **Pages**
   - **Build and deployment** → Source: **GitHub Actions**
   - (No branch dropdown needed — the workflow deploys automatically)

4. **Wait for the workflow**
   - Repo → **Actions** → “Deploy to GitHub Pages” should run on push
   - When it finishes, your site is at:

   `https://YOUR_GITHUB_USERNAME.github.io/Diffley_WC_26/`

**After setup:** any `git push` to `main` rebuilds and redeploys the site.

**If you use a different repo name:** update `repoBase` in `vite.config.ts` to `/<repo-name>/` and push again.

### Updating player teams

Edit `data/draft.json` — each player has an `id` (initials) and three `teams`. Push to GitHub; the site redeploys automatically (after Phase 8).

### Updating scoring rules

Edit `data/scoring.json`. Match points and knockout milestone bonuses are config-driven.

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

### Knockout milestone

Bonus comes from **openfootball knockout fixtures only** — we do not compute group tables or third-place qualifiers.

- **Round of 32 (+1):** when openfootball slots a real team name into a Round of 32 match (replaces placeholders like `1A` or `3C/E/F/H/I`)
- **Later stages:** when the team is named in the next-round fixture or wins through (+2 R16, +3 QF, +5 SF, +6 Final, +8 Winner)
- **During groups:** knockout bonus stays 0 until the R32 bracket is filled in

The 2026 format uses top two per group plus **8 best third-place teams** (32 in the Round of 32). openfootball handles who qualifies when they update the fixtures.

| Furthest stage reached | Bonus |
|---------------|------:|
| Out in groups | 0 |
| Round of 32 | +1 |
| Round of 16 | +2 |
| Quarter-final | +3 |
| Semi-final | +5 |
| Final (runner-up) | +6 |
| Winner | +8 |

**Player total** = sum of all three teams' match points + milestone bonuses.

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
```

---

## Tech stack

- Vite + React + TypeScript
- Static JSON config (no backend)
- Match data: [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)
- Hosting: GitHub Pages

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
| 8 | Pending | GitHub Pages deploy — see README “Deploy to GitHub Pages” |

---

## Original source files

- `World Cup 26.docx` — draft order and team assignments
- `Diffley_WC_2026.xlsx` — early manual spreadsheet (superseded by this app)

---

## License

Internal lab use. Match data courtesy of the openfootball project (public domain).
