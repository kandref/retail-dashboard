# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start development server (Next.js on localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint (flat config, eslint.config.mjs)
- `node scripts/generate-data.js` — Regenerate dummy CSV data for all sub-districts (~9,700 rows)

## Architecture

Next.js 16 App Router retail analytics dashboard for outdoor/adventure retail stores. Uses Tailwind CSS v4 (via `@tailwindcss/postcss`), Recharts for visualization, and NextAuth v4 for authentication. Fictional brands: Summit Gear (outdoor), Nomad Co (lifestyle), Basecamp (urban tech).

### Data Flow

1. **Authentication**: NextAuth credentials provider (`src/lib/auth.ts`) authenticates users by store/sub-district ID (e.g., `DKI01`, `JABAR02`). Each user maps to a `subDistrict` that scopes all their data. Session carries `storeId`, `storeName`, `subDistrict` via JWT callbacks. NextAuth types are extended in the same file.

2. **Dashboard API** (`src/app/api/dashboard/route.ts`): Single GET endpoint that checks session, extracts user's `subDistrict`, and delegates to either `getMockDashboardData()` (development/no GCP credentials) or `getStoreDashboardData()` (production BigQuery). Filters are passed as query params.

3. **Data Layer** (`src/lib/bigquery.ts`): Dual-mode — contains BigQuery queries for production AND a CSV-based mock data system. In dev mode, `getMockDashboardData()` parses `src/dummy tagging new.csv` and computes all KPIs (sales, target, achievement, UPT, basket size, revenue per RA, sales trends at daily/monthly/yearly granularity, RA performance, RA monthly achievement, transaction details). Data is scaled by `SCALE_MULTIPLIER = 75`. The `DashboardData` interface is the central type.

4. **Cascading Filters**: Filter options are hierarchical — each filter level restricts options for subsequent filters (regional → sub-district → distribution channel → site → material type → product type → MGH1→2→3→4 → GWP/BOGO → RA). The dashboard page auto-resets filter values when their options disappear due to upstream filter changes.

### Key Components

- `src/app/dashboard/page.tsx` — Main dashboard (client component). Manages filter state, period selection (week/month/quarter/year), and data fetching. Renders KPI cards, charts, AI insights, and transaction table.
- `src/components/FilterPanel.tsx` — Sidebar filter panel with cascading dropdowns. Exports `FilterValues` and `FilterOptions` types.
- `src/components/charts/` — Barrel-exported chart components: `KPICard`, `SalesTrendChart` (line/bar with daily/monthly/yearly toggle), `RAPerformanceChart`, `AchievementGauge`, `TransactionTable`, `AIInsights` (rule-based, not LLM), `RAMonthlyAchievement`.
- `src/components/SessionProvider.tsx` — Client wrapper for NextAuth `SessionProvider`.

### CSV Data Format

The CSV (`src/dummy tagging new.csv`) has columns parsed by index position (not header name) in `parseCSVLine()`. Column indices are hardcoded in `parseCSV()`. Key columns: LOCATION, SITE_NAME, SUB_DISTRICT, REGIONAL_AREA, INVOICE_NUMBER, SKU fields, sales/qty/price fields, employee fields, SHIPPING_DATE, distribution channel, material type, MGH hierarchy (1-4), PRODUCT_TYPE, IS_GWP, IS_BOGO.

### Environment Variables

- `NEXTAUTH_SECRET` — Required for NextAuth JWT
- `GOOGLE_CLOUD_PROJECT` — GCP project ID (triggers production BigQuery mode)
- `GOOGLE_APPLICATION_CREDENTIALS` — Path to GCP service account key
- `BIGQUERY_DATASET` — BigQuery dataset (default: `retail_analytics`)
- `BIGQUERY_SALES_TABLE` — BigQuery table (default: `sales_data`)

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Currency & Locale

All monetary values use Indonesian Rupiah (`IDR`) formatting with `id-ID` locale. UI text mixes Indonesian and English.
