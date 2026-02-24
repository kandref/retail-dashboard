# Retail Analytics Dashboard

A web-based retail analytics dashboard for monitoring sales performance of outdoor/adventure stores. Built with Next.js 16 App Router, Tailwind CSS v4, and Recharts.

## Overview

This application helps store managers and regional managers monitor store KPIs in real-time — from sales target achievement and Retail Associate (RA) performance to daily/monthly/yearly sales trends.

Fictional brands used:
- **Summit Gear** — outdoor & adventure
- **Nomad Co** — lifestyle
- **Basecamp** — urban tech

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 (App Router) | Main framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 | Styling |
| Recharts | latest | Data visualization |
| NextAuth | v4 | Authentication |
| BigQuery | — | Data source (production) |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional — only required for production mode (BigQuery)
GOOGLE_CLOUD_PROJECT=your_gcp_project_id
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json
BIGQUERY_DATASET=retail_analytics
BIGQUERY_SALES_TABLE=sales_data
```

> If `GOOGLE_CLOUD_PROJECT` is not set, the app automatically uses dummy data from the local CSV file.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test credentials

| Store ID | Password |
|---|---|
| `DKI01` | `dki01` |
| `DKI02` | `dki02` |
| `JABAR01` | `jabar01` |

---

## Project Structure

```
retail-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── dashboard/route.ts   # Main dashboard API endpoint
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Dashboard page (client component)
│   │   └── page.tsx                 # Login/redirect page
│   ├── components/
│   │   ├── charts/                  # Chart components (KPI, trend, RA, etc.)
│   │   ├── FilterPanel.tsx          # Sidebar filter panel (cascading)
│   │   └── SessionProvider.tsx      # NextAuth session wrapper
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth configuration
│   │   └── bigquery.ts              # Data layer (BigQuery + CSV mock)
│   └── dummy tagging new.csv        # Dummy data (~9,700 rows)
├── scripts/
│   └── generate-data.js             # Script to regenerate dummy CSV data
├── CLAUDE.md                        # Guidance file for Claude Code AI
└── README.md
```

---

## Data Flow

```
Login (NextAuth)
    └─▶ JWT Session (storeId, storeName, subDistrict)
            └─▶ GET /api/dashboard?filters...
                    ├─▶ [Dev]  getMockDashboardData() ← CSV parsing
                    └─▶ [Prod] getStoreDashboardData() ← BigQuery query
```

1. **Authentication**: Users log in with their Store ID. The JWT session carries `storeId`, `storeName`, and `subDistrict` for data scoping.
2. **Dashboard API**: A single GET endpoint that detects the environment and delegates to the appropriate data source.
3. **Data Layer**: Dev mode uses a local CSV file with `SCALE_MULTIPLIER = 75`. Production mode uses BigQuery.
4. **Cascading Filters**: Hierarchical filters — each level restricts the options for the level below it (Regional → Sub-district → Channel → Site → and so on).

---

## Features

- **KPI Cards** — Total sales, target, achievement %, UPT, basket size, revenue per RA
- **Sales Trend Chart** — Line/bar chart with granularity toggle (daily / monthly / yearly)
- **RA Performance Chart** — Performance comparison across Retail Associates
- **Achievement Gauge** — Target achievement visualized as a gauge
- **RA Monthly Achievement** — Monthly achievement table per RA
- **AI Insights** — Automated rule-based analysis (not LLM-based)
- **Transaction Table** — Detailed transactions with pagination
- **Cascading Filter Panel** — Multi-level interdependent filters
- **Forecasting** — Sales projection based on historical trends

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Lint with ESLint (flat config)
node scripts/generate-data.js   # Regenerate dummy CSV data
```

---

## Technical Notes

- All monetary values use **IDR (Indonesian Rupiah)** format with `id-ID` locale
- Path alias `@/*` → `./src/*` (configured in `tsconfig.json`)
- The CSV is parsed by **column index**, not header name — reordering columns will break parsing
- UI text mixes Indonesian and English
