# Survivor Board

A season-long NFL survivor pool planner built with React and Vite. The first version maps every 2026 regular-season matchup into a power-ranked grid and adds a transparent, rank-based win estimate for each team and week.

## Run locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The static build is written to `dist/`. The included GitHub Actions workflow deploys that folder to GitHub Pages whenever `main` is pushed.

## Data sources

- Schedule: [NFL.com 2026 team schedules](https://www.nfl.com/schedules/2026/by-team), bundled from the public nflverse schedule dataset
- Rankings: [NFL.com post-2026-draft power rankings](https://www.nfl.com/news/nfl-power-rankings-post-2026-nfl-draft)

The displayed win percentages are planning estimates derived from power-rank difference plus a modest home-field adjustment. They are not sportsbook odds or betting advice.
