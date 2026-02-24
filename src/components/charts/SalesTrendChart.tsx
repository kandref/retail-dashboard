'use client';

import { useState, useMemo, useEffect } from 'react';
import ExportButton from './ExportButton';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SalesTrendData {
  date: string;
  sales: number;
  target: number;
}

type TimeView = 'daily' | 'monthly' | 'yearly';

interface SalesTrendChartProps {
  data: SalesTrendData[];
  dailyData?: SalesTrendData[];
  monthlyData?: SalesTrendData[];
  yearlyData?: SalesTrendData[];
}

type ChartPoint = {
  date: string;
  sales: number | null;
  target: number;
  forecast: number | null;
};

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

const formatCurrencyFull = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const formatDateByView = (dateStr: string, view: TimeView) => {
  if (view === 'yearly') return dateStr;
  if (view === 'monthly') {
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

function movingAverage(values: number[], window = 7): number {
  const slice = values.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function buildForecast(actualData: SalesTrendData[], view: TimeView): { points: ChartPoint[]; hasForecast: boolean } {
  const noForecast = { points: actualData.map(d => ({ ...d, forecast: null })), hasForecast: false };

  if (actualData.length < 2) return noForecast;

  const avgValue = movingAverage(actualData.map(d => d.sales));
  const lastDateStr = actualData[actualData.length - 1].date;
  const futurePoints: ChartPoint[] = [];

  if (view === 'daily') {
    const lastDate = new Date(lastDateStr);
    const endOfMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0);
    const daysAhead = Math.round((endOfMonth.getTime() - lastDate.getTime()) / 86400000);
    if (daysAhead <= 0) return noForecast;

    for (let i = 1; i <= daysAhead; i++) {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i);
      futurePoints.push({ date: d.toISOString().split('T')[0], sales: null, target: 0, forecast: avgValue });
    }
  } else if (view === 'monthly') {
    const [year, month] = lastDateStr.split('-').map(Number);
    const monthsAhead = 12 - month;
    if (monthsAhead <= 0) return noForecast;

    for (let i = 1; i <= monthsAhead; i++) {
      const totalMonth = month + i;
      const y = totalMonth > 12 ? year + 1 : year;
      const m = totalMonth > 12 ? totalMonth - 12 : totalMonth;
      futurePoints.push({ date: `${y}-${String(m).padStart(2, '0')}`, sales: null, target: 0, forecast: avgValue });
    }
  }

  if (futurePoints.length === 0) return noForecast;

  // Bridge: last actual point also carries forecast value so lines connect
  const actualPoints: ChartPoint[] = actualData.map((d, i) => ({
    ...d,
    forecast: i === actualData.length - 1 ? avgValue : null,
  }));

  return { points: [...actualPoints, ...futurePoints], hasForecast: true };
}

export default function SalesTrendChart({ data, dailyData, monthlyData, yearlyData }: SalesTrendChartProps) {
  const [timeView, setTimeView] = useState<TimeView>('daily');
  const [showForecast, setShowForecast] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const rawData = useMemo(() => {
    switch (timeView) {
      case 'yearly': return yearlyData || data;
      case 'monthly': return monthlyData || data;
      default: return dailyData || data;
    }
  }, [timeView, data, dailyData, monthlyData, yearlyData]);

  const { points: chartData, hasForecast } = useMemo(() => {
    if (!showForecast || timeView === 'yearly') {
      return { points: rawData.map(d => ({ ...d, forecast: null })), hasForecast: false };
    }
    return buildForecast(rawData, timeView);
  }, [rawData, showForecast, timeView]);

  const exportData = useMemo(() => rawData.map(item => ({
    Date: formatDateByView(item.date, timeView),
    Sales: item.sales,
    Target: item.target,
  })), [rawData, timeView]);

  const exportColumns = [
    { key: 'Date', header: 'Date' },
    { key: 'Sales', header: 'Sales' },
    { key: 'Target', header: 'Target' },
  ];

  const timeViewButtons: { value: TimeView; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const margin = { top: 5, right: isMobile ? 15 : 30, left: isMobile ? 10 : 20, bottom: 5 };
  const isBar = timeView === 'monthly' || timeView === 'yearly';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
          <ExportButton data={exportData} columns={exportColumns} fileName={`sales-trend-${timeView}`} title={`Sales Trend (${timeView})`} />
        </div>
        <div className="flex items-center gap-2">
          {timeView !== 'yearly' && (
            <button
              onClick={() => setShowForecast(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                showForecast
                  ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Forecast
            </button>
          )}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {timeViewButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setTimeView(btn.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  timeView === btn.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => formatDateByView(val, timeView)}
              tick={{ fontSize: isMobile ? 9 : 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              interval={isBar ? undefined : 'preserveStartEnd'}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const point = payload[0]?.payload as ChartPoint;
                const isForecastPoint = point.sales === null;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
                    <p className="font-medium text-gray-700 mb-1">
                      {formatDateByView(label, timeView)}
                      {isForecastPoint && (
                        <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">Proyeksi</span>
                      )}
                    </p>
                    {point.sales !== null && (
                      <p className="text-blue-600">Sales: {formatCurrencyFull(point.sales)}</p>
                    )}
                    {point.target > 0 && (
                      <p className="text-red-500">Target: {formatCurrencyFull(point.target)}</p>
                    )}
                    {point.forecast !== null && (
                      <p className="text-violet-600">Forecast: {formatCurrencyFull(point.forecast)}</p>
                    )}
                  </div>
                );
              }}
            />
            <Legend />

            {isBar ? (
              <>
                <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.7} />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="sales" name="Sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} connectNulls={false} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />
              </>
            )}

            {showForecast && hasForecast && (
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                activeDot={{ r: 4, fill: '#8b5cf6' }}
                connectNulls={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {showForecast && hasForecast && (
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Forecast dihitung dari rata-rata 7 {timeView === 'daily' ? 'hari' : 'bulan'} terakhir
        </p>
      )}
    </div>
  );
}
