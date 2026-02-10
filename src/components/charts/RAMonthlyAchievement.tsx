'use client';

import { useState, useMemo } from 'react';
import ExportButton from './ExportButton';

interface RAMonthlyData {
  name: string;
  months: {
    month: string;
    sales: number;
    target: number;
    achievement: number;
  }[];
}

interface RAMonthlyAchievementProps {
  data: RAMonthlyData[];
}

export default function RAMonthlyAchievement({ data }: RAMonthlyAchievementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const rowsPerPageOptions = [5, 10, 25];

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      // Sort by consecutive achievement count (desc), then by total achievement (desc)
      const aConsecutive = a.months.filter(m => m.achievement >= 100).length;
      const bConsecutive = b.months.filter(m => m.achievement >= 100).length;

      if (bConsecutive !== aConsecutive) {
        return bConsecutive - aConsecutive;
      }

      const aTotal = a.months.reduce((sum, m) => sum + m.achievement, 0);
      const bTotal = b.months.reduce((sum, m) => sum + m.achievement, 0);
      return bTotal - aTotal;
    });
  }, [data]);

  const getAchievementColor = (achievement: number) => {
    if (achievement >= 100) return 'bg-green-100 text-green-800';
    if (achievement >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getAchievementIcon = (achievement: number) => {
    if (achievement >= 100) return '✓';
    return '✗';
  };

  const getConsecutiveStatus = (months: RAMonthlyData['months']) => {
    const achievedCount = months.filter(m => m.achievement >= 100).length;
    if (achievedCount === 3) {
      return { label: '3 Bulan Achieve', color: 'bg-green-500 text-white', icon: '🏆' };
    } else if (achievedCount === 2) {
      return { label: '2 Bulan Achieve', color: 'bg-blue-500 text-white', icon: '⭐' };
    } else if (achievedCount === 1) {
      return { label: '1 Bulan Achieve', color: 'bg-yellow-500 text-white', icon: '📈' };
    }
    return { label: 'Belum Achieve', color: 'bg-gray-400 text-white', icon: '📉' };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(value);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Monthly Achievement (Q1 2025)</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  const monthNames = data[0]?.months.map(m => m.month) || ['Jan', 'Feb', 'Mar'];

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const exportData = useMemo(() => {
    const rows: Record<string, string | number>[] = [];
    sortedData.forEach(ra => {
      ra.months.forEach(m => {
        rows.push({
          'Employee': ra.name,
          Month: m.month,
          Sales: m.sales,
          Target: m.target,
          'Achievement%': Number(m.achievement.toFixed(2)),
        });
      });
    });
    return rows;
  }, [sortedData]);

  const exportColumns = [
    { key: 'Employee', header: 'Employee' },
    { key: 'Month', header: 'Month' },
    { key: 'Sales', header: 'Sales' },
    { key: 'Target', header: 'Target' },
    { key: 'Achievement%', header: 'Achievement%' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Employee Monthly Achievement (Q1 2025)</h3>
          <ExportButton data={exportData} columns={exportColumns} fileName="employee-monthly-achievement" title="Employee Monthly Achievement" />
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500"></span> Achieve
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-400"></span> Not Achieve
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-600">Employee</th>
              {monthNames.map(month => (
                <th key={month} className="text-center py-3 px-2 font-medium text-gray-600">{month}</th>
              ))}
              <th className="text-center py-3 px-2 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((ra, index) => {
              const status = getConsecutiveStatus(ra.months);
              return (
                <tr key={ra.name} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                  <td className="py-3 px-2">
                    <div className="font-medium text-gray-900">{ra.name}</div>
                  </td>
                  {ra.months.map((month, mIndex) => (
                    <td key={mIndex} className="py-3 px-2">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAchievementColor(month.achievement)}`}>
                          {getAchievementIcon(month.achievement)} {month.achievement.toFixed(0)}%
                        </span>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">{formatCurrency(month.sales)}</span>
                          <span className="text-gray-400"> / {formatCurrency(month.target)}</span>
                        </div>
                      </div>
                    </td>
                  ))}
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 pt-3 border-t border-gray-100 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-1.5 py-0.5 border border-gray-300 rounded text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {rowsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-500">
            {sortedData.length > 0 ? `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, sortedData.length)} of ${sortedData.length}` : '0'}
          </span>
        </div>
        {totalPages > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2 py-0.5 text-xs border rounded ${
                  currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-600">
            {sortedData.filter(ra => ra.months.filter(m => m.achievement >= 100).length === 3).length}
          </div>
          <div className="text-xs text-gray-500">3 Bulan Achieve</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600">
            {sortedData.filter(ra => ra.months.filter(m => m.achievement >= 100).length === 2).length}
          </div>
          <div className="text-xs text-gray-500">2 Bulan Achieve</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-600">
            {sortedData.filter(ra => ra.months.filter(m => m.achievement >= 100).length === 1).length}
          </div>
          <div className="text-xs text-gray-500">1 Bulan Achieve</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-500">
            {sortedData.filter(ra => ra.months.filter(m => m.achievement >= 100).length === 0).length}
          </div>
          <div className="text-xs text-gray-500">Belum Achieve</div>
        </div>
      </div>
    </div>
  );
}
