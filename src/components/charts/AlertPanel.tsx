'use client';

import { useState } from 'react';
import type { RAPerformanceItem, TargetProgress } from '@/lib/bigquery';

interface AlertPanelProps {
  raPerformance: RAPerformanceItem[];
  targetProgress: TargetProgress;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface Alert {
  type: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
}

const PREVIEW_COUNT = 5;

export default function AlertPanel({ raPerformance, targetProgress }: AlertPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const alerts: Alert[] = [];

  // Run-rate alert
  if (!targetProgress.isOnTrack && targetProgress.daysRemaining > 0) {
    alerts.push({
      type: 'critical',
      title: 'Target berisiko tidak tercapai',
      detail: `Projected achievement ${targetProgress.projectedAchievement.toFixed(1)}%. Perlu daily rate ${formatCurrency(targetProgress.requiredDailyRate)} (saat ini ${formatCurrency(targetProgress.dailySalesRate)}).`,
    });
  }

  // RA alerts
  raPerformance.forEach(ra => {
    if (ra.achievement < 80) {
      alerts.push({
        type: 'critical',
        title: `${ra.name} — ${ra.achievement.toFixed(1)}%`,
        detail: `Gap ${formatCurrency(ra.target - ra.revenue)} ke target ${formatCurrency(ra.target)}.`,
      });
    } else if (ra.achievement < 100) {
      alerts.push({
        type: 'warning',
        title: `${ra.name} — ${ra.achievement.toFixed(1)}%`,
        detail: `Butuh ${formatCurrency(ra.target - ra.revenue)} lagi untuk capai target.`,
      });
    }
  });

  if (alerts.length === 0) return null;

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Alerts & Warnings</span>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {criticalCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {warningCount} warning
              </span>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Alerts List */}
      {isExpanded && (
        <div className="px-6 pb-4 space-y-2">
          {showAll && alerts.length > PREVIEW_COUNT && (
            <button
              onClick={() => setShowAll(false)}
              className="w-full flex items-center justify-center gap-2 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Sembunyikan
            </button>
          )}
          {(showAll ? alerts : alerts.slice(0, PREVIEW_COUNT)).map((alert, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-3 flex items-start gap-3 ${
                alert.type === 'critical'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                alert.type === 'critical' ? 'bg-red-500' : 'bg-amber-500'
              }`} />
              <div className="min-w-0">
                <p className={`text-sm font-medium ${
                  alert.type === 'critical' ? 'text-red-800' : 'text-amber-800'
                }`}>{alert.title}</p>
                <p className={`text-xs mt-0.5 ${
                  alert.type === 'critical' ? 'text-red-600' : 'text-amber-600'
                }`}>{alert.detail}</p>
              </div>
            </div>
          ))}

          {alerts.length > PREVIEW_COUNT && (
            <button
              onClick={() => setShowAll(prev => !prev)}
              className="w-full flex items-center justify-center gap-2 pt-1 pb-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
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
                  Tampilkan {alerts.length - PREVIEW_COUNT} alert lainnya
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
