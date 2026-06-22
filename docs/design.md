# Design guidelines — Diffley WC 26

Visual direction for all UI work. Agents and contributors must follow this document.

---

## Intent

The app should feel like a **clean internal tool**, not a consumer game or fan site. Lab members check scores quickly on desktop or phone during the tournament.

**Keywords:** simple, sleek, calm, readable, professional.

**Avoid:** playful illustrations, busy backgrounds, badges, streaks, confetti, mascot characters, neon colours, dense dashboards.

---

## Non-negotiables

1. **No emojis** in UI, empty states, errors, or documentation produced for this app.
2. **Icons:** custom inline SVG only, stored in `src/components/icons/`.
   - 24×24 viewBox, `stroke="currentColor"`, stroke width 1.5
   - No icon fonts, no emoji, no raster icons for UI chrome
   - Country flags: `TeamFlag` via `country-flag-icons` (+ custom England & Scotland SVG)
3. **No decorative clutter** — every element must serve navigation, data, or context.

---

## Layout

- Max content width: `960px` (`--max-width`)
- Single-column on mobile; tables scroll horizontally inside a container when needed
- Header: app title + matches played / last updated + global Refresh
- Tab bar: Leaderboard | Groups | Knockout stage | Fixtures | Rules
- Footer: one line of muted metadata

### Leaderboard summary row

Two-column grid on desktop (`InfoCard.module.css`):

| Left | Right |
|------|-------|
| Upcoming matches (US matchday, UK kickoffs) | Current match (compact, live) + Latest results (up to 3) |

Cards use `--shadow-sm`, light border. Live current match uses accent border + subtle accent background.

---

## Colour

Use CSS tokens from `src/styles/tokens.css`. Do not hardcode hex values in components.

| Token | Use |
|-------|-----|
| `--color-bg` | Page background |
| `--color-surface` | Cards, header |
| `--color-border` | Dividers, table borders |
| `--color-text-primary` | Headings, scores |
| `--color-text-secondary` | Supporting text |
| `--color-text-muted` | Labels, footer |
| `--color-accent` | Links, active tab, live badge, primary button |
| `--color-accent-subtle` | Leader row, current match card |

Dark mode via `prefers-color-scheme` only (no manual toggle unless requested).

---

## Typography

- **Font:** Inter (loaded in `index.html`), fallback system-ui
- **Scale:** xs / sm / base / lg / xl / 2xl tokens
- **Weights:** 400 body, 500 labels, 600 headings and scores
- **Numbers:** tabular figures for score columns

---

## Components

### Tab navigation

- Text labels only (no icon-only tabs on mobile)
- Active state: bottom border, accent colour
- Min tap target: 44px height

### Tables (`DataTable`)

- Primary data display for leaderboard, groups, fixtures, and knockout round lists
- Sticky header on long lists
- Rank column: fixed narrow width
- Expandable rows: chevron on player/team name; keyboard support (Enter/Space)
- Clickable fixture rows open FIFA.com in new tab
- Non-essential columns hidden below 640px (`hideOnMobile`)

### Player filter (`PlayerFilter`)

- Shared across Leaderboard, Groups, Fixtures (not Knockout stage)
- Sits in page header actions alongside tab-specific controls (e.g. Refresh)

### Team names (`TeamName`, `FixtureMatchup`)

- Flag + name inline
- Team names link to FIFA team pages by default
- Avoid nested links (disable team links inside a match-level link)

### Knockout bracket

| Component | Role |
|-----------|------|
| `KnockoutTab` | Narrow: round-by-round list; desktop (1024px+): scrollable column bracket |
| `BracketMatchup` | Compact R32 cards — flag, 3-letter code, owner sublabel |

Round of 32 projected slots use dashed border + `proj.` label. Round of 16+ show feeder paths (M73 vs M75) until a result is in. Final match uses accent card styling.

### Info cards

| Component | Role |
|-----------|------|
| `UpcomingMatchesCard` | Today's US matchday fixtures |
| `CurrentMatchCard` | Live match strip with pulse badge |
| `RecentResultsCard` | Up to 3 latest results |

### Buttons

- Primary: Refresh (header + Fixtures tab)
- Ghost/secondary only when needed

### Empty / loading states

- Short factual copy
- `LoadingState` spinner — no illustrations

---

## Motion

- Transitions: `120ms`–`200ms` ease
- Allowed: tab underline, row expand, refresh spinner, live pulse dot
- Not allowed: bounce, parallax, celebration animations
- `prefers-reduced-motion` respected

---

## Accessibility

- WCAG 2.1 AA contrast (token palette)
- Semantic HTML: `nav`, `main`, `table`, `section`
- Skip link to main content
- Tab pattern with arrow-key navigation
- Expandable rows: `aria-expanded`, row labels
- Visible `:focus-visible` ring
- 44px tap targets on mobile

---

## Reference aesthetic

Think: Linear, GitHub dashboard, or a well-typeset spreadsheet — not fantasy football apps, betting sites, or children's games.

---

## File map

```
src/styles/tokens.css
src/styles/global.css
src/App.module.css
src/components/icons/
src/components/layout/TabNav.tsx
src/components/ui/DataTable.tsx
src/components/ui/TeamName.tsx
src/components/ui/TeamFlag.tsx
src/components/ui/BracketMatchup.tsx
src/components/ui/UpcomingMatchesCard.tsx
src/components/ui/CurrentMatchCard.tsx
src/components/ui/RecentResultsCard.tsx
src/components/tabs/GroupsTab.tsx
src/components/tabs/KnockoutTab.tsx
src/lib/groups.ts
src/lib/bracket.ts
docs/wireframes.md
```

When adding new icons, follow `IconTrophy.tsx` as the template.
