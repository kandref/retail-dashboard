'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { KPICard, SalesTrendChart, RAPerformanceChart, TransactionTable, AIInsights, RAMonthlyAchievement, AchievementHero, AlertPanel, ProductInsights } from '@/components/charts';
import FilterPanel, { FilterValues } from '@/components/FilterPanel';
import type { DashboardData } from '@/lib/bigquery';

type Period = 'week' | 'month' | 'quarter' | 'year';

const defaultFilterValues: FilterValues = {
  dateStart: '',
  dateEnd: '',
  regional: 'All',
  subDistrict: 'All',
  distributionChannel: 'All',
  siteName: 'All',
  materialType: 'All',
  productType: 'All',
  mgh1: 'All',
  mgh2: 'All',
  mgh3: 'All',
  mgh4: 'All',
  gwp: 'All',
  bogo: 'All',
  idRa: 'All',
};

const computeTrend = (current: number, previous: number): number | undefined => {
  if (!previous || previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('month');
  const [filterValues, setFilterValues] = useState<FilterValues>(defaultFilterValues);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, period, filterValues]);

  // Validate and reset filter values when options change (cascading filter effect)
  useEffect(() => {
    if (!data?.filterOptions) return;

    const opts = data.filterOptions;
    const newValues = { ...filterValues };
    let hasChanges = false;

    // Check each filter value - if it's not in the available options, reset to 'All'
    if (filterValues.regional !== 'All' && !opts.regional.includes(filterValues.regional)) {
      newValues.regional = 'All';
      hasChanges = true;
    }
    if (filterValues.subDistrict !== 'All' && !opts.subDistrict.includes(filterValues.subDistrict)) {
      newValues.subDistrict = 'All';
      hasChanges = true;
    }
    if (filterValues.distributionChannel !== 'All' && !opts.distributionChannel.includes(filterValues.distributionChannel)) {
      newValues.distributionChannel = 'All';
      hasChanges = true;
    }
    if (filterValues.siteName !== 'All' && !opts.siteName.includes(filterValues.siteName)) {
      newValues.siteName = 'All';
      hasChanges = true;
    }
    if (filterValues.materialType !== 'All' && !opts.materialType.includes(filterValues.materialType)) {
      newValues.materialType = 'All';
      hasChanges = true;
    }
    if (filterValues.productType !== 'All' && !opts.productType.includes(filterValues.productType)) {
      newValues.productType = 'All';
      hasChanges = true;
    }
    if (filterValues.mgh1 !== 'All' && !opts.mgh1.includes(filterValues.mgh1)) {
      newValues.mgh1 = 'All';
      hasChanges = true;
    }
    if (filterValues.mgh2 !== 'All' && !opts.mgh2.includes(filterValues.mgh2)) {
      newValues.mgh2 = 'All';
      hasChanges = true;
    }
    if (filterValues.mgh3 !== 'All' && !opts.mgh3.includes(filterValues.mgh3)) {
      newValues.mgh3 = 'All';
      hasChanges = true;
    }
    if (filterValues.mgh4 !== 'All' && !opts.mgh4.includes(filterValues.mgh4)) {
      newValues.mgh4 = 'All';
      hasChanges = true;
    }
    if (filterValues.gwp !== 'All' && !opts.gwp.includes(filterValues.gwp)) {
      newValues.gwp = 'All';
      hasChanges = true;
    }
    if (filterValues.bogo !== 'All' && !opts.bogo.includes(filterValues.bogo)) {
      newValues.bogo = 'All';
      hasChanges = true;
    }
    if (filterValues.idRa !== 'All' && !opts.idRa.includes(filterValues.idRa)) {
      newValues.idRa = 'All';
      hasChanges = true;
    }

    if (hasChanges) {
      setFilterValues(newValues);
    }
  }, [data?.filterOptions]);

  const fetchDashboardData = async () => {
    const isInitial = !data;
    if (isInitial) setInitialLoading(true);
    setRefreshing(true);
    try {
      // Build query string with filters
      const params = new URLSearchParams();
      params.set('period', period);

      // Add filter parameters (only if not "All" or empty)
      if (filterValues.dateStart) params.set('dateStart', filterValues.dateStart);
      if (filterValues.dateEnd) params.set('dateEnd', filterValues.dateEnd);
      if (filterValues.regional !== 'All') params.set('regional', filterValues.regional);
      if (filterValues.subDistrict !== 'All') params.set('subDistrict', filterValues.subDistrict);
      if (filterValues.distributionChannel !== 'All') params.set('distributionChannel', filterValues.distributionChannel);
      if (filterValues.siteName !== 'All') params.set('siteName', filterValues.siteName);
      if (filterValues.materialType !== 'All') params.set('materialType', filterValues.materialType);
      if (filterValues.productType !== 'All') params.set('productType', filterValues.productType);
      if (filterValues.mgh1 !== 'All') params.set('mgh1', filterValues.mgh1);
      if (filterValues.mgh2 !== 'All') params.set('mgh2', filterValues.mgh2);
      if (filterValues.mgh3 !== 'All') params.set('mgh3', filterValues.mgh3);
      if (filterValues.mgh4 !== 'All') params.set('mgh4', filterValues.mgh4);
      if (filterValues.gwp !== 'All') params.set('gwp', filterValues.gwp);
      if (filterValues.bogo !== 'All') params.set('bogo', filterValues.bogo);
      if (filterValues.idRa !== 'All') params.set('idRa', filterValues.idRa);

      const response = await fetch(`/api/dashboard?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  if (status === 'loading' || initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Filter Panel — always visible after initial load */}
      {data && (
        <FilterPanel
          options={data.filterOptions}
          values={filterValues}
          onChange={setFilterValues}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 relative">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Retail Dashboard</h1>
                  <p className="text-sm text-gray-500">{session.user.storeName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Refreshing overlay — subtle, doesn't hide content */}
        {refreshing && (
          <div className="absolute inset-0 bg-white/50 z-20 flex items-start justify-center pt-40">
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-lg border border-gray-200">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Updating...</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
        {data ? (
          <div className="space-y-8">
            {/* 1. Achievement Hero (full width) */}
            <AchievementHero
              achievement={data.achievement}
              sales={data.sales}
              target={data.target}
              targetProgress={data.targetProgress}
            />

            {/* 2. Alert Panel (full width) */}
            <AlertPanel
              raPerformance={data.raPerformance}
              targetProgress={data.targetProgress}
            />

            {/* 3. KPI Cards with trends */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <KPICard
                title="Total Sales"
                value={data.sales}
                format="currency"
                trend={computeTrend(data.sales, data.previousPeriod.sales)}
                tooltip={{
                  description: "Total nilai penjualan dalam periode yang dipilih",
                  formula: "SUM(Nett Sales)"
                }}
              />
              <KPICard
                title="Target"
                value={data.target}
                format="currency"
                trend={computeTrend(data.target, data.previousPeriod.target)}
                tooltip={{
                  description: "Target penjualan yang harus dicapai",
                  formula: "SUM(Sales Target)"
                }}
              />
              <KPICard
                title="Avg. Items/Order"
                value={data.unitPerTransaction}
                format="number"
                trend={computeTrend(data.unitPerTransaction, data.previousPeriod.unitPerTransaction)}
                tooltip={{
                  description: "Rata-rata jumlah item per order",
                  formula: "Total Qty / Jumlah Order"
                }}
              />
              <KPICard
                title="Avg. Order Value"
                value={data.basketSize}
                format="currency"
                trend={computeTrend(data.basketSize, data.previousPeriod.basketSize)}
                tooltip={{
                  description: "Rata-rata nilai per order",
                  formula: "Total Sales / Jumlah Order"
                }}
              />
            </div>

            {/* 4. Sales Trend Chart (full width) */}
            <SalesTrendChart
              data={data.salesTrend}
              dailyData={data.salesTrendDaily}
              monthlyData={data.salesTrendMonthly}
              yearlyData={data.salesTrendYearly}
            />

            {/* 5. RA Performance + Product Insights (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RAPerformanceChart data={data.raPerformance} />
              <ProductInsights
                topByRevenue={data.productInsights.topByRevenue}
                topByQuantity={data.productInsights.topByQuantity}
                slowMoving={data.productInsights.slowMoving}
              />
            </div>

            {/* 6. AI Insights (full width) */}
            <AIInsights
              sales={data.sales}
              target={data.target}
              achievement={data.achievement}
              raPerformance={data.raPerformance}
              transactionDetails={data.transactionDetails}
              basketSize={data.basketSize}
              unitPerTransaction={data.unitPerTransaction}
              targetProgress={data.targetProgress}
              productInsights={data.productInsights}
            />

            {/* 7. RA Monthly Achievement (full width) */}
            <RAMonthlyAchievement data={data.raMonthlyAchievement} />

            {/* 8. Transaction Table (full width) */}
            <TransactionTable data={data.transactionDetails} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
