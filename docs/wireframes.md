# Wireframes — Phase 2

Screen-by-screen specification. The running app uses mock data; approve this layout before Phase 3 wires real scores.

---

## User journeys

### 1. Who is winning?
**Goal:** See lab rank at a glance.

| Step | Screen | Element |
|------|--------|---------|
| 1 | Leaderboard (default tab) | Sorted table: rank, player, teams, W-D-L, match pts, bonus, total |
| 2 | — | Leader row highlighted with left accent bar |
| 3 | Optional | Tap player row to expand team breakdown |

### 2. How did BC get those points?
**Goal:** Understand a specific player's score.

| Step | Screen | Element |
|------|--------|---------|
| 1 | Leaderboard | Click player initials |
| 2 | Expanded row | List of 3 teams with per-team match + milestone breakdown (Phase 3) |
| 3 | Teams tab | Filter or find team owner (full 48-team list in Phase 3) |

### 3. What happened last night?
**Goal:** Check recent match results.

| Step | Screen | Element |
|------|--------|---------|
| 1 | Fixtures tab | Chronological table: date, round, home, score, away, status |
| 2 | Header | "Last updated" timestamp (Phase 4) |
| 3 | Fixtures header | Refresh button fetches latest JSON (Phase 4) |

### 4. How are points calculated?
**Goal:** Resolve disputes without asking admin.

| Step | Screen | Element |
|------|--------|---------|
| 1 | Rules tab | Plain-English sections from `data/scoring.json` |
| 2 | — | Milestone bonus table |

---

## Global shell

```
+----------------------------------------------------------+
| [trophy] DIFFLEY LAB          Preview data    [Refresh]  |
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

- **Header:** Brand left, status + refresh right (stacked on mobile)
- **Tabs:** Horizontal scroll on narrow screens, 44px min height
- **Footer:** Single muted line

---

## Tab: Leaderboard

**Default landing tab.** URL: `/` or `#leaderboard`

| Column | Width | Notes |
|--------|-------|-------|
| # | narrow | Rank; leader in accent colour |
| Player | medium | Initials + chevron if expandable |
| Teams | wide | Comma-separated, muted smaller text |
| W-D-L | narrow | Centered |
| Match | narrow | Right-aligned tabular nums |
| Bonus | narrow | Knockout milestone sum |
| Total | narrow | Bold |

**Interactions:**
- Click row toggles expand panel
- Chevron rotates 180deg when open
- Leader row: `--color-accent-subtle` background + left border

---

## Tab: Teams

**All 48 teams** ranked by total points.

| Column | Notes |
|--------|-------|
| # | Rank |
| Team | Name |
| Owner | Player initials |
| P | Played |
| Match | Match points |
| Milestone | Furthest round label |
| Bonus | Milestone points |
| Total | Bold |

Phase 2 preview shows 5 rows. Phase 3 shows full list.

---

## Tab: Fixtures

| Column | Notes |
|--------|-------|
| Date | ISO or formatted |
| Round | Group name or knockout round |
| Home | Team 1 |
| Score | Centered; em dash if scheduled |
| Away | Team 2 |
| Status | `final` (muted pill) or `scheduled` (outline) |

Refresh button in page header (disabled until Phase 4).

---

## Tab: Rules

Card stack layout (not a data table):

1. Overview
2. Match points (bulleted 3/1/0)
3. Penalties
4. Knockout milestone table
5. Your total

Content loaded from `data/scoring.json` — no hardcoded rules in components.

---

## Components built (Phase 2)

| Component | Path |
|-----------|------|
| TabNav | `src/components/layout/TabNav.tsx` |
| DataTable | `src/components/ui/DataTable.tsx` |
| Button | `src/components/ui/Button.tsx` |
| LeaderboardTab | `src/components/tabs/LeaderboardTab.tsx` |
| TeamsTab | `src/components/tabs/TeamsTab.tsx` |
| FixturesTab | `src/components/tabs/FixturesTab.tsx` |
| RulesTab | `src/components/tabs/RulesTab.tsx` |

---

## Approval checklist

- [ ] Tab order and labels correct
- [ ] Leaderboard columns sufficient
- [ ] Expandable player row useful
- [ ] Tables readable on mobile (horizontal scroll OK)
- [ ] Rules tab clear enough for lab
- [ ] Visual tone: simple, sleek, not playful

After approval, Phase 3 replaces mock data with the scoring engine.
