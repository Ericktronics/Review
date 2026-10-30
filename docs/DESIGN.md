# Design direction

Read this before changing the UI.

**Goal:** make coming back to review feel rewarding. The app opens on Today: a daily goal ring, a streak and one obvious button to start.

## Color

Tokens live in `src/index.css`; light and dark share the same roles.

| Role | Used for |
|---|---|
| `canvas`, `raised`, `sunken` | Soft blue-white page, white cards, wells |
| `ink`, `body`, `muted` | Navy text |
| `accent` | Green: primary buttons, progress, "known" |
| `streak` | Orange: streak flame and runs of correct answers |
| `again` | Red: "Review again" and the index-card line between question and answer |
| Group colors (`src/data/groups.ts`) | Topic tiles only |

## Type

Figtree for the interface and reading, IBM Plex Mono for code only.

## Motivation

- Grading updates the daily count, the streak and each card's next due date (1, 3, 7, 14, then 30 days).
- Encouragement must be true: every number comes from real activity, nothing invented.
- Celebrate real moments only: a correct run, the end of a session, the goal being hit.
- Honor `prefers-reduced-motion`.

## Keep

The iPad rules: no `overflow-y` on `html`, `min-w-0` on grid cells, wrapping filter rows.
