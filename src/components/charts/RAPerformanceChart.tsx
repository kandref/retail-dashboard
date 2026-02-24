'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import type { RAPerformanceItem } from '@/lib/bigquery';

interface RAPerformanceChartProps {
  data: RAPerformanceItem[];
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

const formatCurrencyFull = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getBarColor = (achievement: number) => {
  if (achievement >= 100) return '#22c55e'; // green
  if (achievement >= 80) return '#eab308';  // yellow
  return '#ef4444'; // red
};

// Truncate long names
const truncateName = (name: string, maxLength: number = 20) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

const PREVIEW_COUNT = 10;

export default function RAPerformanceChart({ data }: RAPerformanceChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const maxNameLen = isMobile ? 12 : 20;
  const yAxisWidth = isMobile ? 100 : 160;
  const rightMargin = isMobile ? 50 : 60;

  const visibleData = showAll ? data : data.slice(0, PREVIEW_COUNT);

  // Process data to have truncated names for display
  const processedData = visibleData.map(item => ({
    ...item,
    displayName: truncateName(item.name, maxNameLen),
    fullName: item.name,
    achievementLabel: `${item.achievement.toFixed(0)}%`,
  }));

  // Dynamic height based on number of RAs (minimum 320px, 40px per RA)
  const chartHeight = Math.max(320, visibleData.length * 40);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Revenue per Employee ({data.length})</h3>
      <div className="flex gap-3 mb-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block"></span> {'\u2265'}100%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block"></span> {'\u2265'}80%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span> {'<'}80%</span>
      </div>
      {showAll && data.length > PREVIEW_COUNT && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full flex items-center justify-center gap-2 py-1 mb-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Sembunyikan
        </button>
      )}
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} layout="vertical" margin={{ top: 5, right: rightMargin, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              tick={{ fontSize: 11, fill: '#374151' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              width={yAxisWidth}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
                    <p className="font-semibold text-gray-900">{d.fullName}</p>
                    <p className="text-xs text-gray-500 mb-2">{d.siteName || '-'}</p>
                    <p className="text-gray-600">Revenue: {formatCurrencyFull(d.revenue)}</p>
                    <p className="text-gray-600">Target: {formatCurrencyFull(d.target)}</p>
                    <p className={`font-medium ${d.achievement >= 100 ? 'text-green-600' : d.achievement >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                      Achievement: {d.achievement.toFixed(1)}%
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
              {processedData.map((item, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(item.achievement)} />
              ))}
              <LabelList
                dataKey="achievementLabel"
                position="right"
                style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.length > PREVIEW_COUNT && (
        <button
          onClick={() => setShowAll(prev => !prev)}
          className="w-full flex items-center justify-center gap-2 mt-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          {showAll ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Sembunyikan
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Tampilkan {data.length - PREVIEW_COUNT} employee lainnya
            </>
          )}
        </button>
      )}
    </div>
  );
}
