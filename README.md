# Retail Analytics Dashboard

Dashboard analitik retail berbasis web untuk memantau performa penjualan toko outdoor/adventure. Dibangun dengan Next.js 16 App Router, Tailwind CSS v4, dan Recharts.

## Gambaran Umum

Aplikasi ini dirancang untuk membantu store manager dan regional manager memantau KPI toko secara real-time — mulai dari pencapaian target penjualan, performa RA (Retail Associate), hingga tren penjualan harian/bulanan/tahunan.

Merek fiktif yang digunakan:
- **Summit Gear** — outdoor & adventure
- **Nomad Co** — lifestyle
- **Basecamp** — urban tech

---

## Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| Next.js | 16 (App Router) | Framework utama |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 | Styling |
| Recharts | latest | Visualisasi data |
| NextAuth | v4 | Autentikasi |
| BigQuery | — | Data source (produksi) |

---

## Cara Menjalankan

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment variables

Buat file `.env.local` di root project:

```env
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Opsional — hanya diperlukan untuk mode produksi (BigQuery)
GOOGLE_CLOUD_PROJECT=your_gcp_project_id
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json
BIGQUERY_DATASET=retail_analytics
BIGQUERY_SALES_TABLE=sales_data
```

> Jika `GOOGLE_CLOUD_PROJECT` tidak di-set, aplikasi otomatis menggunakan data dummy dari CSV.

### 3. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Login untuk testing

| Store ID | Password |
|---|---|
| `DKI01` | `dki01` |
| `DKI02` | `dki02` |
| `JABAR01` | `jabar01` |

---

## Struktur Proyek

```
retail-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── dashboard/route.ts   # API endpoint utama dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Halaman dashboard (client component)
│   │   └── page.tsx                 # Halaman login/redirect
│   ├── components/
│   │   ├── charts/                  # Komponen chart (KPI, trend, RA, dsb.)
│   │   ├── FilterPanel.tsx          # Panel filter sidebar (cascading)
│   │   └── SessionProvider.tsx      # Wrapper NextAuth session
│   ├── lib/
│   │   ├── auth.ts                  # Konfigurasi NextAuth
│   │   └── bigquery.ts              # Data layer (BigQuery + CSV mock)
│   └── dummy tagging new.csv        # Data dummy (~9.700 baris)
├── scripts/
│   └── generate-data.js             # Script regenerasi data dummy
├── CLAUDE.md                        # Panduan untuk Claude Code AI
└── README.md
```

---

## Alur Data

```
Login (NextAuth)
    └─▶ Session JWT (storeId, storeName, subDistrict)
            └─▶ GET /api/dashboard?filters...
                    ├─▶ [Dev]  getMockDashboardData() ← CSV parsing
                    └─▶ [Prod] getStoreDashboardData() ← BigQuery query
```

1. **Autentikasi**: User login dengan Store ID sebagai username. Session JWT menyimpan `storeId`, `storeName`, dan `subDistrict` untuk scoping data.
2. **API Dashboard**: Satu endpoint GET yang mendeteksi environment dan mendelegasikan ke data source yang sesuai.
3. **Data Layer**: Mode dev menggunakan CSV lokal dengan `SCALE_MULTIPLIER = 75`. Mode prod menggunakan BigQuery.
4. **Cascading Filters**: Filter berjenjang — setiap level filter membatasi opsi filter di bawahnya (Regional → Sub-district → Channel → Site → dst.).

---

## Fitur Utama

- **KPI Cards** — Total penjualan, target, achievement %, UPT, basket size, revenue per RA
- **Sales Trend Chart** — Line/bar chart dengan toggle granularitas (harian / bulanan / tahunan)
- **RA Performance Chart** — Perbandingan performa antar Retail Associate
- **Achievement Gauge** — Visualisasi pencapaian target dalam bentuk gauge
- **RA Monthly Achievement** — Tabel pencapaian bulanan per RA
- **AI Insights** — Analisis otomatis berbasis aturan (rule-based, bukan LLM)
- **Transaction Table** — Detail transaksi dengan pagination
- **Cascading Filter Panel** — Filter multi-level yang saling berhubungan
- **Forecasting** — Proyeksi penjualan berdasarkan tren historis

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Lint dengan ESLint (flat config)
node scripts/generate-data.js   # Regenerasi data dummy CSV
```

---

## Catatan Teknis

- Semua nilai moneter menggunakan format **IDR (Rupiah)** dengan locale `id-ID`
- Path alias `@/*` → `./src/*` (dikonfigurasi di `tsconfig.json`)
- CSV di-parse berdasarkan **index kolom** (bukan nama header) — perubahan urutan kolom akan merusak parsing
- UI menggunakan campuran Bahasa Indonesia dan Inggris
