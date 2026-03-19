# F1 HUB 2026

A cinematic Formula 1 dashboard built with Next.js.  
It combines live standings, schedule + results context, RSS news aggregation, and a probability-based prediction engine in a single-page experience.

## Why This Project Stands Out

- Live + fallback data strategy (app stays usable if upstream APIs fail)
- Distinctive motorsport-style UI/UX with intro sequence and animated sections
- Prediction modules for:
  - Race win probability
  - Championship probability
  - Podium projection
  - Championship scenario calculator
- No API keys required for core data sources

## Feature Overview

### Core Pages

- `Home`  
  Hero dashboard, podium cards, live data badge, top standings snapshot.

- `Teams`  
  Constructor cards and points overview.

- `Team Detail`  
  Team hero with car render, specs, and driver profile sections.

- `Drivers`  
  Full table with click-through to team detail.

- `Schedule`  
  Round-by-round calendar with status (`done`, `next`, `upcoming`, `cancelled`) and winner where available.

- `News`  
  Multi-source RSS feed aggregation with image/category handling and fallback news.

- `Race Oracle` (`predictor`)  
  Probability panels, podium picks, factor explainers, and gap-closing targets.

- `Calc` (`calculator`)  
  Championship paths simulator (wins/podiums/avg points + possibility checks).

## Data Sources

No secrets required.

| Source | Usage |
|---|---|
| Ergast F1 API | Driver standings, constructor standings, last race, full season schedule |
| Autosport RSS | News feed |
| Motorsport RSS | News feed |
| RaceFans RSS | News feed |

## Data Refresh Strategy

Client polling via SWR:

- `/api/standings`: every `300000ms` (5 min)
- `/api/schedule`: every `3600000ms` (1 hour)
- `/api/news`: every `600000ms` (10 min)

Server response caching (API routes):

- `standings`: `s-maxage=120, stale-while-revalidate=300`
- `schedule`: `s-maxage=3600, stale-while-revalidate=7200`
- `news`: `s-maxage=600, stale-while-revalidate=1200`

## Prediction Engine

Location: [`lib/predictor.js`](./lib/predictor.js)

### Race Win Model

Weighted scoring + softmax normalization:

- Championship points form: `30%`
- Recent form: `25%`
- Car performance: `20%`
- Circuit history: `15%`
- Driver rating: `10%`

### Championship Model

Combines:

- Gap-to-leader factor
- Driver/team pace proxy
- Recent form

Returns normalized championship probabilities for the current grid.

## Architecture

This repository uses the Pages Router and keeps UI flow in one main page file:

```text
pages/
  _app.js
  index.js               # Main SPA shell + page switching + components
  api/
    standings.js         # Ergast + static fallback
    schedule.js          # Ergast + static fallback
    news.js              # RSS aggregation + static fallback
lib/
  predictor.js           # Probability models
styles/
  globals.css            # Full visual system
next.config.mjs          # API headers + app config
```

## Local Setup

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

Production build:

```bash
npm run build
npm run start
```

## API Contracts (Quick View)

### `GET /api/standings`
- `source`, `lastUpdated`, `drivers[]`, `constructors[]`, `podium[]`, `lastRace`, `round`

### `GET /api/schedule`
- `source`, `lastUpdated`, `calendar[]`, `season`, `totalRounds`

### `GET /api/news`
- `source`, `lastUpdated`, `articles[]`

## Fallback Behavior

Each API route catches upstream failures and returns static data so UI sections remain populated.  
The UI surfaces source freshness via the live/fallback badge.

## Tech Stack

- Next.js 14 (Pages Router)
- React 18
- SWR
- fast-xml-parser
- CSS (single global stylesheet)

## Notes for Contributors

- UI state + routing are currently managed in [`pages/index.js`](./pages/index.js)
- Team colors, static season metadata, and visual copy are centralized there
- Prediction tuning lives in [`lib/predictor.js`](./lib/predictor.js)
- Keep fallback payloads in API routes consistent with frontend expectations
