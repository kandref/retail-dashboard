import { BigQuery } from '@google-cloud/bigquery';
import * as fs from 'fs';
import * as path from 'path';

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const dataset = process.env.BIGQUERY_DATASET || 'retail_analytics';
const salesTable = process.env.BIGQUERY_SALES_TABLE || 'sales_data';

// CSV Parser
interface CSVRow {
  LOCATION: string;
  SITE_NAME: string;
  SUB_DISTRICT: string;
  REGIONAL_AREA: string;
  INVOICE_NUMBER: string;
  ORDER_NUMBER: string;
  SKU_NUMBER: string;
  SKU_NAME: string;
  TOTAL_QTY: number;
  UNIT_PRICE: number;
  MP_PRICE: number;
  NETT_SALES: number;
  SALES: number;
  EMPLOYEE_NUMBER: string;
  EMPLOYEE_NAME: string;
  SALES_TARGET: number;
  SALES_TARGET_UNIQ: number;
  POSITION: string;
  CHANNEL_NAME: string;
  STATUS: string;
  DIST_CHAN_DESC: string;
  MATL_TYPE_DESC: string;
  MGH_1: string;
  MGH_2: string;
  MGH_3: string;
  MGH_4: string;
  PRODUCT_TYPE: string;
  IS_GWP: string;
  IS_BOGO: string;
  SHIPPING_DATE: string;
}

function parseCSV(): CSVRow[] {
  try {
    const csvPath = path.join(process.cwd(), 'src', 'dummy tagging new.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= headers.length) {
        const row: CSVRow = {
          LOCATION: values[0] || '',
          SITE_NAME: values[1] || '',
          SUB_DISTRICT: values[2] || '',
          REGIONAL_AREA: values[3] || '',
          INVOICE_NUMBER: values[4] || '',
          ORDER_NUMBER: values[5] || '',
          SKU_NUMBER: values[8] || '',
          SKU_NAME: values[9] || '',
          TOTAL_QTY: parseFloat(values[10]) || 0,
          UNIT_PRICE: parseFloat(values[11]) || 0,
          MP_PRICE: parseFloat(values[12]) || 0,
          NETT_SALES: parseFloat(values[13]) || 0,
          SALES: parseFloat(values[14]) || 0,
          EMPLOYEE_NUMBER: values[20] || '',
          EMPLOYEE_NAME: values[21] || '',
          SALES_TARGET: parseFloat(values[22]) || 0,
          SALES_TARGET_UNIQ: parseFloat(values[23]) || 0,
          POSITION: values[24] || '',
          CHANNEL_NAME: values[27] || '',
          STATUS: values[28] || '',
          DIST_CHAN_DESC: values[33] || '',
          MATL_TYPE_DESC: values[35] || '',
          MGH_1: values[37] || '',
          MGH_2: values[38] || '',
          MGH_3: values[39] || '',
          MGH_4: values[40] || '',
          PRODUCT_TYPE: values[41] || '',
          IS_BOGO: values[43] || '',
          IS_GWP: values[44] || '',
          SHIPPING_DATE: values[34] || '',
        };
        rows.push(row);
      }
    }

    return rows;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

export interface TransactionDetail {
  location: string;
  siteName: string;
  regional: string;
  invoiceNumber: string;
  skuName: string;
  qty: number;
  unitPrice: number;
  nettSales: number;
  sales: number; // Gross sales
  salesTarget: number; // Target harian per employee
  salesTargetUniq: number; // Target bulanan per employee
  employeeName: string;
  position: string;
  channelName: string;
  status: string;
  category: string;
  productType: string;
}

export interface FilterOptions {
  regional: string[];
  subDistrict: string[];
  distributionChannel: string[];
  siteName: string[];
  materialType: string[];
  productType: string[];
  mgh1: string[];
  mgh2: string[];
  mgh3: string[];
  mgh4: string[];
  gwp: string[];
  bogo: string[];
  idRa: string[];
}

export interface RAMonthlyData {
  name: string;
  months: {
    month: string;
    sales: number;
    target: number;
    achievement: number;
  }[];
}

export interface SalesTrendItem {
  date: string;
  sales: number;
  target: number;
}

export interface RAPerformanceItem {
  name: string;
  revenue: number;
  target: number;
  achievement: number;
}

export interface ProductSummary {
  skuName: string;
  category: string;
  productType: string;
  totalRevenue: number;
  totalQty: number;
  transactionCount: number;
}

export interface PreviousPeriodData {
  sales: number;
  target: number;
  achievement: number;
  unitPerTransaction: number;
  basketSize: number;
  revenuePerRA: number;
}

export interface TargetProgress {
  daysElapsed: number;
  daysTotal: number;
  daysRemaining: number;
  dailySalesRate: number;
  requiredDailyRate: number;
  projectedSales: number;
  projectedAchievement: number;
  isOnTrack: boolean;
}

export interface DashboardData {
  sales: number;
  target: number;
  achievement: number;
  unitPerTransaction: number;
  basketSize: number;
  revenuePerRA: number;
  salesTrend: SalesTrendItem[];
  salesTrendDaily: SalesTrendItem[];
  salesTrendMonthly: SalesTrendItem[];
  salesTrendYearly: SalesTrendItem[];
  raPerformance: RAPerformanceItem[];
  transactionDetails: TransactionDetail[];
  filterOptions: FilterOptions;
  raMonthlyAchievement: RAMonthlyData[];
  previousPeriod: PreviousPeriodData;
  productInsights: {
    topByRevenue: ProductSummary[];
    topByQuantity: ProductSummary[];
    slowMoving: ProductSummary[];
  };
  targetProgress: TargetProgress;
}

export async function getStoreDashboardData(storeId: string, period: string = 'month'): Promise<DashboardData> {
  // Date range based on period
  const dateFilter = getDateFilter(period);

  // Query for main KPIs
  const kpiQuery = `
    SELECT
      SUM(sales_amount) as total_sales,
      SUM(target_amount) as total_target,
      SAFE_DIVIDE(SUM(sales_amount), SUM(target_amount)) * 100 as achievement,
      SAFE_DIVIDE(SUM(units_sold), COUNT(DISTINCT transaction_id)) as unit_per_transaction,
      SAFE_DIVIDE(SUM(sales_amount), COUNT(DISTINCT transaction_id)) as basket_size,
      SAFE_DIVIDE(SUM(sales_amount), COUNT(DISTINCT retail_assistant_id)) as revenue_per_ra
    FROM \`${dataset}.${salesTable}\`
    WHERE store_id = @storeId
      AND ${dateFilter}
  `;

  // Query for sales trend
  const trendQuery = `
    SELECT
      FORMAT_DATE('%Y-%m-%d', date) as date,
      SUM(sales_amount) as sales,
      SUM(target_amount) as target
    FROM \`${dataset}.${salesTable}\`
    WHERE store_id = @storeId
      AND ${dateFilter}
    GROUP BY date
    ORDER BY date
  `;

  // Query for RA performance
  const raQuery = `
    SELECT
      retail_assistant_name as name,
      SUM(sales_amount) as revenue
    FROM \`${dataset}.${salesTable}\`
    WHERE store_id = @storeId
      AND ${dateFilter}
    GROUP BY retail_assistant_name
    ORDER BY revenue DESC
    LIMIT 10
  `;

  const options = {
    query: '',
    params: { storeId },
  };

  try {
    // Execute KPI query
    options.query = kpiQuery;
    const [kpiRows] = await bigquery.query(options);
    const kpi = kpiRows[0] || {};

    // Execute trend query
    options.query = trendQuery;
    const [trendRows] = await bigquery.query(options);

    // Execute RA query
    options.query = raQuery;
    const [raRows] = await bigquery.query(options);

    return {
      sales: Number(kpi.total_sales) || 0,
      target: Number(kpi.total_target) || 0,
      achievement: Number(kpi.achievement) || 0,
      unitPerTransaction: Number(kpi.unit_per_transaction) || 0,
      basketSize: Number(kpi.basket_size) || 0,
      revenuePerRA: Number(kpi.revenue_per_ra) || 0,
      salesTrend: trendRows.map((row: { date: string; sales: number; target: number }) => ({
        date: row.date,
        sales: Number(row.sales),
        target: Number(row.target),
      })),
      salesTrendDaily: [],
      salesTrendMonthly: [],
      salesTrendYearly: [],
      raPerformance: raRows.map((row: { name: string; revenue: number }) => ({
        name: row.name,
        revenue: Number(row.revenue),
        target: 0,
        achievement: 0,
      })),
      transactionDetails: [],
      filterOptions: { regional: [], subDistrict: [], distributionChannel: [], siteName: [], materialType: [], productType: [], mgh1: [], mgh2: [], mgh3: [], mgh4: [], gwp: [], bogo: [], idRa: [] },
      raMonthlyAchievement: [],
      previousPeriod: { sales: 0, target: 0, achievement: 0, unitPerTransaction: 0, basketSize: 0, revenuePerRA: 0 },
      productInsights: { topByRevenue: [], topByQuantity: [], slowMoving: [] },
      targetProgress: { daysElapsed: 0, daysTotal: 30, daysRemaining: 30, dailySalesRate: 0, requiredDailyRate: 0, projectedSales: 0, projectedAchievement: 0, isOnTrack: false },
    };
  } catch (error) {
    console.error('BigQuery error:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}

function getDateFilter(period: string): string {
  switch (period) {
    case 'week':
      return 'date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)';
    case 'month':
      return 'date >= DATE_TRUNC(CURRENT_DATE(), MONTH)';
    case 'quarter':
      return 'date >= DATE_TRUNC(CURRENT_DATE(), QUARTER)';
    case 'year':
      return 'date >= DATE_TRUNC(CURRENT_DATE(), YEAR)';
    default:
      return 'date >= DATE_TRUNC(CURRENT_DATE(), MONTH)';
  }
}

// Interface untuk filter
export interface DashboardFilters {
  dateStart?: string;
  dateEnd?: string;
  regional?: string;
  subDistrict?: string;
  distributionChannel?: string;
  siteName?: string;
  materialType?: string;
  productType?: string;
  mgh1?: string;
  mgh2?: string;
  mgh3?: string;
  mgh4?: string;
  gwp?: string;
  bogo?: string;
  idRa?: string;
}

// Data dari dummy tagging.csv - Retail Stores
// Dihitung secara dinamis dari file CSV
export function getMockDashboardData(userSubDistrict?: string, filters?: DashboardFilters): DashboardData {
  let csvData = parseCSV();

  // Filter by user's subDistrict first (from login)
  if (userSubDistrict) {
    csvData = csvData.filter(row => row.SUB_DISTRICT === userSubDistrict);
  }

  // Apply additional filters
  if (filters) {
    // Date filter
    if (filters.dateStart) {
      csvData = csvData.filter(row => {
        if (!row.SHIPPING_DATE) return true;
        const rowDate = row.SHIPPING_DATE.split(' ')[0];
        return rowDate >= filters.dateStart!;
      });
    }
    if (filters.dateEnd) {
      csvData = csvData.filter(row => {
        if (!row.SHIPPING_DATE) return true;
        const rowDate = row.SHIPPING_DATE.split(' ')[0];
        return rowDate <= filters.dateEnd!;
      });
    }

    // Other filters (only apply if not "All")
    if (filters.regional && filters.regional !== 'All') {
      csvData = csvData.filter(row => row.REGIONAL_AREA === filters.regional);
    }
    if (filters.subDistrict && filters.subDistrict !== 'All') {
      csvData = csvData.filter(row => row.SUB_DISTRICT === filters.subDistrict);
    }
    if (filters.distributionChannel && filters.distributionChannel !== 'All') {
      csvData = csvData.filter(row => row.DIST_CHAN_DESC === filters.distributionChannel);
    }
    if (filters.siteName && filters.siteName !== 'All') {
      csvData = csvData.filter(row => row.SITE_NAME === filters.siteName);
    }
    if (filters.materialType && filters.materialType !== 'All') {
      csvData = csvData.filter(row => row.MATL_TYPE_DESC === filters.materialType);
    }
    if (filters.productType && filters.productType !== 'All') {
      csvData = csvData.filter(row => row.PRODUCT_TYPE === filters.productType);
    }
    if (filters.mgh1 && filters.mgh1 !== 'All') {
      csvData = csvData.filter(row => row.MGH_1 === filters.mgh1);
    }
    if (filters.mgh2 && filters.mgh2 !== 'All') {
      csvData = csvData.filter(row => row.MGH_2 === filters.mgh2);
    }
    if (filters.mgh3 && filters.mgh3 !== 'All') {
      csvData = csvData.filter(row => row.MGH_3 === filters.mgh3);
    }
    if (filters.mgh4 && filters.mgh4 !== 'All') {
      csvData = csvData.filter(row => row.MGH_4 === filters.mgh4);
    }
    if (filters.gwp && filters.gwp !== 'All') {
      csvData = csvData.filter(row => row.IS_GWP === filters.gwp);
    }
    if (filters.bogo && filters.bogo !== 'All') {
      csvData = csvData.filter(row => row.IS_BOGO === filters.bogo);
    }
    if (filters.idRa && filters.idRa !== 'All') {
      csvData = csvData.filter(row => row.EMPLOYEE_NAME === filters.idRa);
    }
  }

  // Filter transaksi positif (penjualan)
  const positiveTransactions = csvData.filter(row => row.TOTAL_QTY > 0);
  // Filter transaksi negatif (return/reversal)
  const negativeTransactions = csvData.filter(row => row.TOTAL_QTY < 0);

  // Multiplier untuk scale up angka ke jutaan (simulasi data bulanan)
  const SCALE_MULTIPLIER = 75;

  // Hitung total sales dari transaksi positif (scaled)
  const rawSales = positiveTransactions.reduce((sum, row) => sum + Math.abs(row.SALES), 0);
  const sales = rawSales * SCALE_MULTIPLIER;

  // Target dari CSV (SALES_TARGET_UNIQ per RA per bulan, deduplicated)
  const overallTargetTracked = new Set<string>();
  let target = 0;
  csvData.forEach(row => {
    if (!row.SHIPPING_DATE || !row.EMPLOYEE_NAME) return;
    const monthKey = row.SHIPPING_DATE.split(' ')[0].substring(0, 7);
    const raKey = `${row.EMPLOYEE_NAME}::${monthKey}`;
    if (!overallTargetTracked.has(raKey) && row.SALES_TARGET_UNIQ > 0) {
      overallTargetTracked.add(raKey);
      target += row.SALES_TARGET_UNIQ * SCALE_MULTIPLIER;
    }
  });
  target = Math.round(target);

  // Hitung total qty dan unique transactions
  const totalQty = positiveTransactions.reduce((sum, row) => sum + row.TOTAL_QTY, 0);
  const uniqueInvoices = new Set(positiveTransactions.map(row => row.INVOICE_NUMBER)).size;
  const uniqueEmployees = new Set(positiveTransactions.map(row => row.EMPLOYEE_NUMBER)).size;

  // Hitung RA Performance (scaled) - termasuk semua RA di subdistrict
  const raRevenue = new Map<string, number>();
  const raTarget = new Map<string, number>();

  // Daftarkan semua RA dan sum monthly targets (deduplicated per RA per month)
  const raTargetMonthly = new Map<string, Map<string, number>>();
  csvData.forEach(row => {
    if (row.EMPLOYEE_NAME && !raRevenue.has(row.EMPLOYEE_NAME)) {
      raRevenue.set(row.EMPLOYEE_NAME, 0);
    }
    if (row.EMPLOYEE_NAME && row.SHIPPING_DATE && row.SALES_TARGET_UNIQ > 0) {
      const monthKey = row.SHIPPING_DATE.split(' ')[0].substring(0, 7);
      if (!raTargetMonthly.has(row.EMPLOYEE_NAME)) {
        raTargetMonthly.set(row.EMPLOYEE_NAME, new Map());
      }
      raTargetMonthly.get(row.EMPLOYEE_NAME)!.set(monthKey, row.SALES_TARGET_UNIQ * SCALE_MULTIPLIER);
    }
  });
  raTargetMonthly.forEach((months, raName) => {
    let total = 0;
    months.forEach(t => total += t);
    raTarget.set(raName, total);
  });

  // Kemudian, hitung revenue dari transaksi positif
  positiveTransactions.forEach(row => {
    const current = raRevenue.get(row.EMPLOYEE_NAME) || 0;
    raRevenue.set(row.EMPLOYEE_NAME, current + Math.abs(row.SALES) * SCALE_MULTIPLIER);
  });

  const raPerformance: RAPerformanceItem[] = Array.from(raRevenue.entries())
    .map(([name, revenue]) => {
      const raTargetVal = raTarget.get(name) || 0;
      const achievement = raTargetVal > 0 ? (revenue / raTargetVal) * 100 : 0;
      return { name, revenue, target: Math.round(raTargetVal), achievement: parseFloat(achievement.toFixed(1)) };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Generate sales trend from actual CSV data (using csvData which is filtered)
  // IMPORTANT: SALES_TARGET_UNIQ is a monthly target per RA — only count once per RA per period

  // Daily aggregation — sales from positive transactions only (consistent with KPI)
  const dailySalesMap = new Map<string, { sales: number; target: number }>();
  const dailyTargetTracked = new Set<string>();
  positiveTransactions.forEach(row => {
    if (!row.SHIPPING_DATE) return;
    const datePart = row.SHIPPING_DATE.split(' ')[0];
    const existing = dailySalesMap.get(datePart) || { sales: 0, target: 0 };
    existing.sales += row.SALES * SCALE_MULTIPLIER;
    // Only count each RA's daily target once per date
    const raDateKey = `${row.EMPLOYEE_NAME}::${datePart}`;
    if (!dailyTargetTracked.has(raDateKey) && row.SALES_TARGET_UNIQ > 0) {
      dailyTargetTracked.add(raDateKey);
      existing.target += row.SALES_TARGET_UNIQ * SCALE_MULTIPLIER / 30;
    }
    dailySalesMap.set(datePart, existing);
  });

  const salesTrendDaily: SalesTrendItem[] = Array.from(dailySalesMap.entries())
    .map(([date, data]) => ({
      date,
      sales: Math.round(data.sales),
      target: Math.round(data.target),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Monthly aggregation — only count each RA's target once per month
  const monthlySalesMap = new Map<string, { sales: number; target: number }>();
  const monthlyTargetTracked = new Set<string>();
  positiveTransactions.forEach(row => {
    if (!row.SHIPPING_DATE) return;
    const datePart = row.SHIPPING_DATE.split(' ')[0];
    const [year, month] = datePart.split('-');
    const monthKey = `${year}-${month}`;
    const existing = monthlySalesMap.get(monthKey) || { sales: 0, target: 0 };
    existing.sales += row.SALES * SCALE_MULTIPLIER;
    const raMonthKey = `${row.EMPLOYEE_NAME}::${monthKey}`;
    if (!monthlyTargetTracked.has(raMonthKey) && row.SALES_TARGET_UNIQ > 0) {
      monthlyTargetTracked.add(raMonthKey);
      existing.target += row.SALES_TARGET_UNIQ * SCALE_MULTIPLIER;
    }
    monthlySalesMap.set(monthKey, existing);
  });

  const salesTrendMonthly: SalesTrendItem[] = Array.from(monthlySalesMap.entries())
    .map(([date, data]) => ({
      date,
      sales: Math.round(data.sales),
      target: Math.round(data.target),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Yearly aggregation — only count each RA's target once per month within the year
  const yearlySalesMap = new Map<string, { sales: number; target: number }>();
  const yearlyTargetTracked = new Set<string>();
  positiveTransactions.forEach(row => {
    if (!row.SHIPPING_DATE) return;
    const datePart = row.SHIPPING_DATE.split(' ')[0];
    const [year, month] = datePart.split('-');
    const existing = yearlySalesMap.get(year) || { sales: 0, target: 0 };
    existing.sales += row.SALES * SCALE_MULTIPLIER;
    const raMonthKey = `${row.EMPLOYEE_NAME}::${year}-${month}`;
    if (!yearlyTargetTracked.has(raMonthKey) && row.SALES_TARGET_UNIQ > 0) {
      yearlyTargetTracked.add(raMonthKey);
      existing.target += row.SALES_TARGET_UNIQ * SCALE_MULTIPLIER;
    }
    yearlySalesMap.set(year, existing);
  });

  const salesTrendYearly: SalesTrendItem[] = Array.from(yearlySalesMap.entries())
    .map(([date, data]) => ({
      date,
      sales: Math.round(data.sales),
      target: Math.round(data.target),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Default salesTrend uses daily data
  const salesTrend = salesTrendDaily;

  // Generate transaction details from CSV (scaled, all positive values)
  const transactionDetails: TransactionDetail[] = csvData.map(row => ({
    location: row.LOCATION,
    siteName: row.SITE_NAME,
    regional: row.REGIONAL_AREA,
    invoiceNumber: row.INVOICE_NUMBER,
    skuName: row.SKU_NAME,
    qty: Math.abs(row.TOTAL_QTY) * SCALE_MULTIPLIER,
    unitPrice: row.UNIT_PRICE,
    nettSales: Math.abs(row.NETT_SALES) * SCALE_MULTIPLIER,
    sales: Math.abs(row.SALES) * SCALE_MULTIPLIER,
    salesTarget: row.SALES_TARGET,
    salesTargetUniq: row.SALES_TARGET_UNIQ,
    employeeName: row.EMPLOYEE_NAME,
    position: row.POSITION,
    channelName: row.CHANNEL_NAME,
    status: row.STATUS,
    category: row.MGH_3,
    productType: row.PRODUCT_TYPE,
  }));

  // Generate filter options based on user's subdistrict data (hierarchical filtering)
  // Start with data filtered by user's subdistrict
  let baseData = parseCSV();
  if (userSubDistrict) {
    baseData = baseData.filter(row => row.SUB_DISTRICT === userSubDistrict);
  }

  const getUniqueValues = (data: CSVRow[], getter: (row: CSVRow) => string) =>
    [...new Set(data.map(getter).filter(v => v && v.trim()))].sort();

  // Build cascading filter data - each level filters for the next
  // Level 1: Base data (filtered by user's subdistrict)
  let level1Data = [...baseData];

  // Level 2: After Regional filter
  let level2Data = [...level1Data];
  if (filters?.regional && filters.regional !== 'All') {
    level2Data = level2Data.filter(row => row.REGIONAL_AREA === filters.regional);
  }

  // Level 3: After Sub District filter
  let level3Data = [...level2Data];
  if (filters?.subDistrict && filters.subDistrict !== 'All') {
    level3Data = level3Data.filter(row => row.SUB_DISTRICT === filters.subDistrict);
  }

  // Level 4: After Distribution Channel filter
  let level4Data = [...level3Data];
  if (filters?.distributionChannel && filters.distributionChannel !== 'All') {
    level4Data = level4Data.filter(row => row.DIST_CHAN_DESC === filters.distributionChannel);
  }

  // Level 5: After Site Name filter
  let level5Data = [...level4Data];
  if (filters?.siteName && filters.siteName !== 'All') {
    level5Data = level5Data.filter(row => row.SITE_NAME === filters.siteName);
  }

  // Level 6: After Material Type filter
  let level6Data = [...level5Data];
  if (filters?.materialType && filters.materialType !== 'All') {
    level6Data = level6Data.filter(row => row.MATL_TYPE_DESC === filters.materialType);
  }

  // Level 7: After Product Type filter
  let level7Data = [...level6Data];
  if (filters?.productType && filters.productType !== 'All') {
    level7Data = level7Data.filter(row => row.PRODUCT_TYPE === filters.productType);
  }

  // Level 8: After MGH1 filter
  let level8Data = [...level7Data];
  if (filters?.mgh1 && filters.mgh1 !== 'All') {
    level8Data = level8Data.filter(row => row.MGH_1 === filters.mgh1);
  }

  // Level 9: After MGH2 filter
  let level9Data = [...level8Data];
  if (filters?.mgh2 && filters.mgh2 !== 'All') {
    level9Data = level9Data.filter(row => row.MGH_2 === filters.mgh2);
  }

  // Level 10: After MGH3 filter
  let level10Data = [...level9Data];
  if (filters?.mgh3 && filters.mgh3 !== 'All') {
    level10Data = level10Data.filter(row => row.MGH_3 === filters.mgh3);
  }

  // Get options based on cascade level - each filter shows options available AFTER previous filters applied
  const filterOptions: FilterOptions = {
    // Regional: from base data (user's subdistrict)
    regional: getUniqueValues(level1Data, r => r.REGIONAL_AREA),
    // Sub District: after regional filter
    subDistrict: getUniqueValues(level2Data, r => r.SUB_DISTRICT),
    // Distribution Channel: after subdistrict filter
    distributionChannel: getUniqueValues(level3Data, r => r.DIST_CHAN_DESC),
    // Site Name: after distribution channel filter
    siteName: getUniqueValues(level4Data, r => r.SITE_NAME),
    // Material Type: after site name filter
    materialType: getUniqueValues(level5Data, r => r.MATL_TYPE_DESC),
    // Product Type: after material type filter
    productType: getUniqueValues(level6Data, r => r.PRODUCT_TYPE),
    // MGH 1: after product type filter
    mgh1: getUniqueValues(level7Data, r => r.MGH_1),
    // MGH 2: after MGH1 filter
    mgh2: getUniqueValues(level8Data, r => r.MGH_2),
    // MGH 3: after MGH2 filter
    mgh3: getUniqueValues(level9Data, r => r.MGH_3),
    // MGH 4: after MGH3 filter
    mgh4: getUniqueValues(level10Data, r => r.MGH_4),
    // GWP: from current filtered data
    gwp: getUniqueValues(level10Data, r => r.IS_GWP),
    // BOGO: from current filtered data
    bogo: getUniqueValues(level10Data, r => r.IS_BOGO),
    // ID RA: after site name filter (employees at selected site)
    idRa: getUniqueValues(level5Data, r => r.EMPLOYEE_NAME),
  };

  // Calculate RA Monthly Achievement (Q1: January, February, March)
  const monthNames = ['Jan', 'Feb', 'Mar'];
  const raMonthlyMap = new Map<string, { months: Map<number, { sales: number; target: number }> }>();

  // Initialize all RAs with empty monthly data
  baseData.forEach(row => {
    if (row.EMPLOYEE_NAME && !raMonthlyMap.has(row.EMPLOYEE_NAME)) {
      raMonthlyMap.set(row.EMPLOYEE_NAME, {
        months: new Map([
          [1, { sales: 0, target: 0 }],
          [2, { sales: 0, target: 0 }],
          [3, { sales: 0, target: 0 }],
        ])
      });
    }
  });

  // Aggregate sales (positive only) and targets by RA and month
  const basePositive = baseData.filter(row => row.TOTAL_QTY > 0);
  basePositive.forEach(row => {
    if (!row.EMPLOYEE_NAME || !row.SHIPPING_DATE) return;

    const datePart = row.SHIPPING_DATE.split(' ')[0];
    const month = parseInt(datePart.split('-')[1], 10);

    if (month >= 1 && month <= 3) {
      const raData = raMonthlyMap.get(row.EMPLOYEE_NAME);
      if (raData) {
        const monthData = raData.months.get(month);
        if (monthData) {
          monthData.sales += row.SALES * SCALE_MULTIPLIER;
          if (row.SALES_TARGET_UNIQ > 0) {
            monthData.target = row.SALES_TARGET_UNIQ * SCALE_MULTIPLIER;
          }
        }
      }
    }
  });

  // Convert to array format
  const raMonthlyAchievement: RAMonthlyData[] = Array.from(raMonthlyMap.entries()).map(([name, data]) => ({
    name,
    months: monthNames.map((monthName, index) => {
      const monthNum = index + 1;
      const monthData = data.months.get(monthNum) || { sales: 0, target: 0 };
      const targetValue = monthData.target;
      return {
        month: monthName,
        sales: Math.round(monthData.sales),
        target: Math.round(targetValue),
        achievement: targetValue > 0 ? (monthData.sales / targetValue) * 100 : 0,
      };
    }),
  }));

  // === Previous Period Computation ===
  // Get date range from current data
  const allDates = csvData
    .map(r => r.SHIPPING_DATE ? r.SHIPPING_DATE.split(' ')[0] : '')
    .filter(d => d)
    .sort();
  const currentStartDate = allDates[0] || '';
  const currentEndDate = allDates[allDates.length - 1] || '';

  let previousPeriod: PreviousPeriodData = { sales: 0, target: 0, achievement: 0, unitPerTransaction: 0, basketSize: 0, revenuePerRA: 0 };

  if (currentStartDate && currentEndDate) {
    const startMs = new Date(currentStartDate).getTime();
    const endMs = new Date(currentEndDate).getTime();
    const durationMs = endMs - startMs;
    const prevEndDate = new Date(startMs - 1).toISOString().split('T')[0];
    const prevStartDate = new Date(startMs - durationMs - 86400000).toISOString().split('T')[0];

    // Get unfiltered base data for previous period
    let prevData = parseCSV();
    if (userSubDistrict) {
      prevData = prevData.filter(row => row.SUB_DISTRICT === userSubDistrict);
    }
    prevData = prevData.filter(row => {
      if (!row.SHIPPING_DATE) return false;
      const d = row.SHIPPING_DATE.split(' ')[0];
      return d >= prevStartDate && d <= prevEndDate;
    });

    const prevPositive = prevData.filter(r => r.TOTAL_QTY > 0);
    const prevSales = prevPositive.reduce((s, r) => s + Math.abs(r.SALES), 0) * SCALE_MULTIPLIER;
    // Compute previous period target from CSV (deduplicated per RA per month)
    const prevTargetTracked = new Set<string>();
    let prevTarget = 0;
    prevData.forEach(r => {
      if (!r.SHIPPING_DATE || !r.EMPLOYEE_NAME || r.SALES_TARGET_UNIQ <= 0) return;
      const mk = r.SHIPPING_DATE.split(' ')[0].substring(0, 7);
      const k = `${r.EMPLOYEE_NAME}::${mk}`;
      if (!prevTargetTracked.has(k)) {
        prevTargetTracked.add(k);
        prevTarget += r.SALES_TARGET_UNIQ * SCALE_MULTIPLIER;
      }
    });
    prevTarget = Math.round(prevTarget);
    const prevQty = prevPositive.reduce((s, r) => s + r.TOTAL_QTY, 0);
    const prevInvoices = new Set(prevPositive.map(r => r.INVOICE_NUMBER)).size;
    const prevEmployees = new Set(prevPositive.map(r => r.EMPLOYEE_NUMBER)).size;

    previousPeriod = {
      sales: prevSales,
      target: prevTarget,
      achievement: prevTarget > 0 ? parseFloat(((prevSales / prevTarget) * 100).toFixed(2)) : 0,
      unitPerTransaction: prevInvoices > 0 ? parseFloat((prevQty / prevInvoices).toFixed(2)) : 0,
      basketSize: prevInvoices > 0 ? Math.round(prevSales / prevInvoices) : 0,
      revenuePerRA: prevEmployees > 0 ? Math.round(prevSales / prevEmployees) : 0,
    };
  }

  // === Product Insights ===
  const productMap = new Map<string, { skuName: string; category: string; productType: string; totalRevenue: number; totalQty: number; invoices: Set<string> }>();
  positiveTransactions.forEach(row => {
    const key = row.SKU_NAME;
    if (!key) return;
    const existing = productMap.get(key);
    if (existing) {
      existing.totalRevenue += Math.abs(row.SALES) * SCALE_MULTIPLIER;
      existing.totalQty += row.TOTAL_QTY * SCALE_MULTIPLIER;
      existing.invoices.add(row.INVOICE_NUMBER);
    } else {
      productMap.set(key, {
        skuName: row.SKU_NAME,
        category: row.MGH_3,
        productType: row.PRODUCT_TYPE,
        totalRevenue: Math.abs(row.SALES) * SCALE_MULTIPLIER,
        totalQty: row.TOTAL_QTY * SCALE_MULTIPLIER,
        invoices: new Set([row.INVOICE_NUMBER]),
      });
    }
  });

  const allProducts: ProductSummary[] = Array.from(productMap.values()).map(p => ({
    skuName: p.skuName,
    category: p.category,
    productType: p.productType,
    totalRevenue: Math.round(p.totalRevenue),
    totalQty: Math.round(p.totalQty),
    transactionCount: p.invoices.size,
  }));

  const topByRevenue = [...allProducts].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);
  const topByQuantity = [...allProducts].sort((a, b) => b.totalQty - a.totalQty).slice(0, 10);
  const slowMoving = [...allProducts].sort((a, b) => a.totalRevenue - b.totalRevenue).slice(0, 10);

  // === Target Progress ===
  const roundedTarget = Math.round(target);
  let targetProgress: TargetProgress;
  if (currentStartDate && currentEndDate) {
    const startD = new Date(currentStartDate);
    const endD = new Date(currentEndDate);
    // Assume period is the full month of the latest date
    const periodStart = new Date(endD.getFullYear(), endD.getMonth(), 1);
    const periodEnd = new Date(endD.getFullYear(), endD.getMonth() + 1, 0);
    const daysTotal = Math.max(1, Math.ceil((periodEnd.getTime() - periodStart.getTime()) / 86400000) + 1);
    const daysElapsed = Math.max(1, Math.ceil((endD.getTime() - periodStart.getTime()) / 86400000) + 1);
    const daysRemaining = Math.max(0, daysTotal - daysElapsed);
    const dailySalesRate = sales / daysElapsed;
    const remaining = roundedTarget - sales;
    const requiredDailyRate = daysRemaining > 0 ? remaining / daysRemaining : 0;
    const projectedSales = Math.round(dailySalesRate * daysTotal);
    const projectedAchievement = roundedTarget > 0 ? parseFloat(((projectedSales / roundedTarget) * 100).toFixed(1)) : 0;

    targetProgress = {
      daysElapsed,
      daysTotal,
      daysRemaining,
      dailySalesRate: Math.round(dailySalesRate),
      requiredDailyRate: Math.round(requiredDailyRate),
      projectedSales,
      projectedAchievement,
      isOnTrack: projectedAchievement >= 100,
    };
  } else {
    targetProgress = {
      daysElapsed: 0, daysTotal: 30, daysRemaining: 30,
      dailySalesRate: 0, requiredDailyRate: 0,
      projectedSales: 0, projectedAchievement: 0, isOnTrack: false,
    };
  }

  return {
    sales,
    target: roundedTarget,
    achievement: roundedTarget > 0 ? parseFloat(((sales / roundedTarget) * 100).toFixed(2)) : 0,
    unitPerTransaction: uniqueInvoices > 0 ? parseFloat((totalQty / uniqueInvoices).toFixed(2)) : 0,
    basketSize: uniqueInvoices > 0 ? Math.round(sales / uniqueInvoices) : 0,
    revenuePerRA: uniqueEmployees > 0 ? Math.round(sales / uniqueEmployees) : 0,
    salesTrend,
    salesTrendDaily,
    salesTrendMonthly,
    salesTrendYearly,
    raPerformance,
    transactionDetails,
    filterOptions,
    raMonthlyAchievement,
    previousPeriod,
    productInsights: { topByRevenue, topByQuantity, slowMoving },
    targetProgress,
  };
}
