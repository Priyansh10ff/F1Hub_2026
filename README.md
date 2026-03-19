# F1 HUB 2026 — Next.js Real-Time App

A full-featured Formula 1 dashboard built with Next.js featuring **real-time data**, **live news**, and an **AI-powered race predictor**.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open http://localhost:3000
```

## ✅ Free APIs Used (No API Keys Required)

| API | Purpose | Refresh Rate |
|-----|---------|-------------|
| **Ergast F1 API** (ergast.com) | Standings, schedule, race results | Every 5 minutes |
| **Autosport RSS** | Live F1 news | Every 10 minutes |
| **Motorsport.com RSS** | Additional news | Every 10 minutes |
| **RaceFans RSS** | Analysis & commentary | Every 10 minutes |

All APIs are completely **free** and require **no API keys**.

## 🏎 Features

### Real-Time Data
- **Driver Championship Standings** — fetched live from Ergast API
- **Constructor Standings** — auto-updates after every race
- **Race Calendar** — live schedule with winners populated after each race
- **Last Race Podium** — automatically pulls the most recent race result
- **News Feed** — live RSS from 3 F1 news sources

### 🤖 AI Predictor
The predictor uses a **5-factor weighted probability model**:

| Factor | Weight | Description |
|--------|--------|-------------|
| Championship Points | 30% | Normalized current points vs field leader |
| Recent Race Form | 25% | Exponentially weighted last 5 results |
| Car Performance | 20% | Constructor 2026 pace rating |
| Circuit History | 15% | Career wins at the specific circuit |
| Driver Rating | 10% | Expert-weighted talent score |

Final probabilities use **softmax normalization** for statistically valid output.

### Auto-Refresh Schedule
- Standings: Every 5 minutes
- Schedule: Every 1 hour  
- News: Every 10 minutes
- Predictor: Recalculates whenever standings update

## 📁 Project Structure

```
f1-hub-nextjs/
├── pages/
│   ├── index.js          # Main SPA with all components
│   ├── _app.js           # App wrapper
│   └── api/
│       ├── standings.js  # Driver + constructor standings (Ergast)
│       ├── schedule.js   # Race calendar (Ergast)
│       └── news.js       # Live news (RSS feeds)
├── lib/
│   └── predictor.js      # 5-factor prediction algorithm
├── styles/
│   └── globals.css       # Complete design system
└── next.config.mjs
```

## 🛠 Tech Stack
- **Next.js 14** — React framework
- **SWR** — Data fetching with auto-refresh
- **fast-xml-parser** — RSS feed parsing (no external service needed)
- **Ergast API** — Free F1 data (no key)
- **RSS Feeds** — Free news (no key)

## 🌐 Deploy to Vercel (Free)

```bash
npm install -g vercel
vercel
```

That's it! Vercel's free tier is more than sufficient for this app.

## ⚙️ Fallback System

If any API is temporarily unavailable, the app automatically falls back to the latest known 2026 season data. A color-coded badge shows whether you're viewing live or cached data:
- 🟢 **Green dot** = Live API data
- 🟡 **Orange dot** = Static fallback data
