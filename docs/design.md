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
   - Country flags: inline SVG via `TeamFlag` / `country-flag-icons` (+ custom England & Scotland)
3. **No decorative clutter** — every element must serve navigation, data, or context.

---

## Layout

- Max content width: `960px` (`--max-width`)
- Single-column on mobile; tables may scroll horizontally inside a container if needed
- Header: app title + last updated + refresh (Phase 4)
- Tab bar: Leaderboard | Teams | Fixtures | Rules
- Footer: one line of muted metadata

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
| `--color-accent` | Links, active tab, primary button |
| `--color-accent-subtle` | Selected row background |

Dark mode via `prefers-color-scheme` only (no manual toggle in v1 unless requested).

---

## Typography

- **Font:** Inter (loaded in `index.html`), fallback system-ui
- **Scale:** xs / sm / base / lg / xl / 2xl tokens
- **Weights:** 400 body, 500 labels, 600 headings and scores
- **Letter-spacing:** slight tightening on large headings (`-0.02em`)
- **Numbers:** tabular figures where available for aligned score columns

---

## Components (planned)

### Tab navigation

- Text labels only (no icon-only tabs on mobile)
- Active state: bottom border or subtle background, accent colour
- Min tap target: 44px height

### Tables

- Primary data display for leaderboard and fixtures
- Sticky header on long lists (Phase 3+)
- Zebra optional — prefer horizontal rules only
- Rank column: fixed narrow width
- Expandable row for player team breakdown (chevron SVG, not emoji)

### Buttons

- Primary: Refresh results (Phase 4)
- Ghost/secondary only when needed
- No gradient buttons

### Cards

- Light border + subtle shadow (`--shadow-sm`)
- Used sparingly — prefer tables for data

### Empty / loading states

- Short factual copy ("No results yet")
- Simple SVG spinner or skeleton lines — no illustrations

---

## Motion

- Transitions: `120ms`–`200ms` ease
- Allowed: tab underline, row expand, refresh spinner
- Not allowed: bounce, parallax, celebration animations

---

## Accessibility

- WCAG 2.1 AA contrast for text (token palette verified)
- Semantic HTML: `nav`, `main`, `table`, `th`, `caption`, `section`
- Skip link to main content
- Tab pattern: `role="tablist"` / `role="tab"` / `role="tabpanel"` with arrow-key navigation
- `aria-current` / `aria-selected` on active tab
- Expandable leaderboard rows: keyboard (Enter/Space), `aria-expanded`, row labels
- Visible `:focus-visible` ring (global.css)
- Mobile: 44px tap targets; non-essential table columns hidden below 640px
- `prefers-reduced-motion` respected for animations

---

## Reference aesthetic

Think: Linear, GitHub dashboard, or a well-typeset spreadsheet — not: fantasy football apps, betting sites, or children's games.

---

## File map

```
src/styles/tokens.css           Design tokens
src/styles/global.css           Reset and base
src/App.module.css              Shell layout
src/components/icons/           SVG icons
src/components/layout/          TabNav, page header
src/components/ui/              DataTable, Button
src/components/tabs/            Tab wireframes
docs/wireframes.md              Screen-by-screen spec (Phase 2)
```

When adding new icons, follow `IconTrophy.tsx` as the template.

---

## Phase 2 status

Wireframe UI is live in the dev server for review. Mock data in `src/data/mockPreview.ts`. Real data wiring is Phase 3.
