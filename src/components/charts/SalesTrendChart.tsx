'use client';

import { useState, useMemo, useEffect } from 'react';
import ExportButton from './ExportButton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
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

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

const formatDateByView = (dateStr: string, view: TimeView) => {
  if (view === 'yearly') {
    return dateStr; // Just year like "2025"
  }
  if (view === 'monthly') {
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
  // Daily
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

export default function SalesTrendChart({ data, dailyData, monthlyData, yearlyData }: SalesTrendChartProps) {
  const [timeView, setTimeView] = useState<TimeView>('daily');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const chartData = useMemo(() => {
    switch (timeView) {
      case 'yearly':
        return yearlyData || data;
      case 'monthly':
        return monthlyData || data;
      case 'daily':
      default:
        return dailyData || data;
    }
  }, [timeView, data, dailyData, monthlyData, yearlyData]);

  const timeViewButtons: { value: TimeView; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const exportData = useMemo(() => chartData.map(item => ({
    Date: formatDateByView(item.date, timeView),
    Sales: item.sales,
    Target: item.target,
  })), [chartData, timeView]);

  const exportColumns = [
    { key: 'Date', header: 'Date' },
    { key: 'Sales', header: 'Sales' },
    { key: 'Target', header: 'Target' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
          <ExportButton data={exportData} columns={exportColumns} fileName={`sales-trend-${timeView}`} title={`Sales Trend (${timeView})`} />
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {timeViewButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setTimeView(btn.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
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
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {timeView === 'monthly' || timeView === 'yearly' ? (
            <BarChart data={chartData} margin={{ top: 5, right: isMobile ? 15 : 30, left: isMobile ? 10 : 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(val) => formatDateByView(val, timeView)}
                tick={{ fontSize: isMobile ? 9 : 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(Number(value ?? 0))
                }
                labelFormatter={(label) => formatDateByView(label, timeView)}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: isMobile ? 15 : 30, left: isMobile ? 10 : 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(val) => formatDateByView(val, timeView)}
                tick={{ fontSize: isMobile ? 9 : 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(Number(value ?? 0))
                }
                labelFormatter={(label) => formatDateByView(label, timeView)}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
