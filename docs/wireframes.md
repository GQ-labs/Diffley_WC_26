# UI reference — Diffley WC 26

Screen-by-screen specification for the shipped app. Use this when changing layout or copy.

---

## User journeys

### 1. Who is winning?

| Step | Screen | Element |
|------|--------|---------|
| 1 | Leaderboard (default) | Sorted table: rank, player, teams, W-D-L, match pts, bonus, total |
| 2 | — | Leader row highlighted (accent background + left bar) |
| 3 | Optional | Click player row to expand team breakdown |

### 2. What is on today?

| Step | Screen | Element |
|------|--------|---------|
| 1 | Leaderboard top | Upcoming matches — US matchday, UK kickoff times |
| 2 | Leaderboard top-right | Current match (if live) — score, minute, FIFA link |
| 3 | Leaderboard top-right | Latest results — up to 3 finished games |

### 3. How did my teams do?

| Step | Screen | Element |
|------|--------|---------|
| 1 | Any tab | **Show player** dropdown (shared `?player=` URL) |
| 2 | Teams | Three teams only; expand for match history |
| 3 | Fixtures | Matches involving those teams only |

### 4. Full fixture list / FIFA details

| Step | Screen | Element |
|------|--------|---------|
| 1 | Fixtures | Chronological table; click row for FIFA match page |
| 2 | — | Team names link to FIFA team pages throughout app |

### 5. How are points calculated?

| Step | Screen | Element |
|------|--------|---------|
| 1 | Rules | Sections from `data/scoring.json` |

---

## Global shell

```
+----------------------------------------------------------+
| [trophy] DIFFLEY LAB          N played · Updated  [Ref] |
|          World Cup 2026                                   |
+----------------------------------------------------------+
| Leaderboard | Teams | Fixtures | Rules                    |
+----------------------------------------------------------+
|                                                           |
|  (active tab content)                                     |
|                                                           |
+----------------------------------------------------------+
| 16 players · 48 teams · Points tracker                    |
+----------------------------------------------------------+
```

- **Header:** Brand left; status + global Refresh right (stacks on mobile)
- **Tabs:** Horizontal scroll on narrow screens, 44px min height
- **Footer:** Single muted line

---

## Tab: Leaderboard

**Default landing tab.** URL: `/` or `?player=<id>`

### Summary cards (desktop: two columns)

**Left — Upcoming matches**

- Label + US matchday subtitle
- List: UK kickoff time | teams | round
- Each row links to FIFA when mapped

**Right — stacked**

1. **Current match** (hidden when nothing live) — accent card, Live badge, score, minute, updated time
2. **Latest results** — up to 3 rows with round + date; FIFA links

### Player table

| Column | Notes |
|--------|-------|
| # | Rank; leader in accent |
| Player | Nickname + chevron |
| Teams | Flag + name list (hidden mobile) |
| W-D-L | Centered |
| Match / Bonus / Total | Right-aligned tabular nums |

**Show player** in page header — filters table only; summary cards always show tournament-wide data.

---

## Tab: Teams

All 48 teams (or 3 when player filtered), ranked by total points.

| Column | Notes |
|--------|-------|
| # | Global tournament rank |
| Team | Flag + name + chevron |
| Owner | Player nickname |
| P / Match / Milestone / Bonus / Total | As leaderboard |

**Expand row:** match history list — W/D/L badge, score, opponent, round, FIFA link.

**Show player** in page header.

---

## Tab: Fixtures

| Column | Notes |
|--------|-------|
| Date | openfootball date |
| Round | Group or knockout label |
| Home / Away | Flag + name (FIFA team links) |
| Score | Centered; em dash if scheduled |
| Status | `final` or `scheduled` pill |

- Click row → FIFA match page (when mapped)
- **Show player** + **Refresh** in page header

---

## Tab: Rules

Card stack from `data/scoring.json` — overview, match points, penalties, knockout table, player total.

---

## Components

| Component | Path |
|-----------|------|
| TabNav, PageHeader | `src/components/layout/TabNav.tsx` |
| DataTable | `src/components/ui/DataTable.tsx` |
| PlayerFilter | `src/components/ui/PlayerFilter.tsx` |
| TeamName, TeamFlag, FixtureMatchup | `src/components/ui/TeamName.tsx`, `TeamFlag.tsx` |
| UpcomingMatchesCard | `src/components/ui/UpcomingMatchesCard.tsx` |
| CurrentMatchCard | `src/components/ui/CurrentMatchCard.tsx` |
| RecentResultsCard | `src/components/ui/RecentResultsCard.tsx` |
| LeaderboardTab | `src/components/tabs/LeaderboardTab.tsx` |
| TeamsTab | `src/components/tabs/TeamsTab.tsx` |
| FixturesTab | `src/components/tabs/FixturesTab.tsx` |
| RulesTab | `src/components/tabs/RulesTab.tsx` |

---

## URL conventions

| Param | Example | Effect |
|-------|---------|--------|
| `?player=sam` | `?player=sam#fixtures` | Filter player on Leaderboard, Teams, Fixtures |
| `#teams` | `/#teams` | Open Teams tab |
| `#fixtures` | `/#fixtures` | Open Fixtures tab |
| `#rules` | `/#rules` | Open Rules tab |

Player param is preserved when switching tabs. Tab hash is preserved when changing player.
