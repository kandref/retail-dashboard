'use client';

import { useState } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  format?: 'currency' | 'percentage' | 'number';
  tooltip?: {
    formula?: string;
    description?: string;
  };
}

export default function KPICard({ title, value, subtitle, trend, format = 'number', tooltip }: KPICardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('id-ID', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(val);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        {tooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-6 z-50 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 rotate-45"></div>
                {tooltip.description && (
                  <p className="mb-2">{tooltip.description}</p>
                )}
                {tooltip.formula && (
                  <div className="bg-gray-800 rounded px-2 py-1 font-mono text-xs">
                    {tooltip.formula}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-xl font-bold text-gray-900 mt-1">{formatValue(value)}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      {trend !== undefined && (
        <div className={`flex items-center mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <span className="text-xs font-medium">
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400 ml-2">vs last period</span>
        </div>
      )}
    </div>
  );
}
