'use client';

import { useState, useMemo } from 'react';
import type { TransactionDetail } from '@/lib/bigquery';
import ExportButton from './ExportButton';

interface TransactionTableProps {
  data: TransactionDetail[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

// Format currency compact (millions)
const formatCompact = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

// Hitung achievement dari sales / salesTarget * 100
const calculateAchievement = (sales: number, salesTarget: number): number => {
  if (salesTarget === 0) return 0;
  return (sales / salesTarget) * 100;
};

const getAchievementColor = (achievement: number) => {
  if (achievement >= 100) {
    return 'bg-green-100 text-green-800';
  } else if (achievement >= 96 && achievement <= 99) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-red-100 text-red-800';
  }
};

const getAchievementBadgeColor = (achievement: number) => {
  if (achievement >= 100) {
    return 'bg-green-500';
  } else if (achievement >= 96 && achievement <= 99) {
    return 'bg-yellow-500';
  } else {
    return 'bg-red-500';
  }
};

export default function TransactionTable({ data }: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRegional, setFilterRegional] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const rowsPerPageOptions = [20, 50, 100, 200];

  // Get unique categories and regionals for filters
  const categories = [...new Set(data.map((item) => item.category))].sort();
  const regionals = [...new Set(data.map((item) => item.regional))].sort();

  // Filter data
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.skuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || item.category === filterCategory;
    const matchesRegional = filterRegional === '' || item.regional === filterRegional;
    return matchesSearch && matchesCategory && matchesRegional;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Summary stats
  const totalSales = filteredData.reduce((sum, item) => sum + item.sales, 0);
  const totalSalesTarget = filteredData.reduce((sum, item) => sum + item.salesTarget, 0);
  const totalQty = filteredData.reduce((sum, item) => sum + item.qty, 0);
  // Achievement dihitung dari total sales / total salesTarget
  const avgAchievement = totalSalesTarget > 0 ? calculateAchievement(totalSales, totalSalesTarget) : 0;

  const exportData = useMemo(() => filteredData.map(item => ({
    Store: item.siteName,
    SKU: item.skuName,
    Qty: item.qty,
    Sales: item.sales,
    Target: item.salesTarget,
    'Target Uniq': item.salesTargetUniq,
    Employee: item.employeeName,
    Channel: item.channelName,
    Category: item.category,
    'Achievement%': Number(calculateAchievement(item.sales, item.salesTarget).toFixed(2)),
  })), [filteredData]);

  const exportColumns = [
    { key: 'Store', header: 'Store' },
    { key: 'SKU', header: 'SKU' },
    { key: 'Qty', header: 'Qty' },
    { key: 'Sales', header: 'Sales' },
    { key: 'Target', header: 'Target' },
    { key: 'Target Uniq', header: 'Target Uniq' },
    { key: 'Employee', header: 'Employee' },
    { key: 'Channel', header: 'Channel' },
    { key: 'Category', header: 'Category' },
    { key: 'Achievement%', header: 'Achievement%' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 lg:mb-0">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
          <ExportButton data={exportData} columns={exportColumns} fileName="transaction-details" title="Transaction Details" />
        </div>

        {/* Summary Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="bg-blue-50 px-3 py-1 rounded-lg">
            <span className="text-blue-600 font-medium">{filteredData.length}</span>
            <span className="text-blue-500 ml-1">Transactions</span>
          </div>
          <div className="bg-green-50 px-3 py-1 rounded-lg">
            <span className="text-green-600 font-medium">{formatCurrency(totalSales)}</span>
            <span className="text-green-500 ml-1">Total Sales</span>
          </div>
          <div className="bg-orange-50 px-3 py-1 rounded-lg">
            <span className="text-orange-600 font-medium">{formatCurrency(totalSalesTarget)}</span>
            <span className="text-orange-500 ml-1">Total Target</span>
          </div>
          <div className="bg-purple-50 px-3 py-1 rounded-lg">
            <span className="text-purple-600 font-medium">{totalQty}</span>
            <span className="text-purple-500 ml-1">Units</span>
          </div>
          <div className={`px-3 py-1 rounded-lg ${getAchievementColor(avgAchievement)}`}>
            <span className="font-medium">{avgAchievement.toFixed(2)}%</span>
            <span className="ml-1">Achievement</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by SKU, Employee, Store, Invoice..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterRegional}
          onChange={(e) => {
            setFilterRegional(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="">All Regionals</option>
          {regionals.map((reg) => (
            <option key={reg} value={reg}>{reg}</option>
          ))}
        </select>
      </div>

      {/* Achievement Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-600">100%+ (On Target)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="text-gray-600">96-99% (Near Target)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-gray-600">&lt;95% (Below Target)</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-3 font-semibold text-gray-600">Store</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-600">SKU Name</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-600">Qty</th>
              <th className="text-right py-3 px-3 font-semibold text-gray-600">Sales</th>
              <th className="text-right py-3 px-3 font-semibold text-gray-600">Target</th>
              <th className="text-right py-3 px-3 font-semibold text-gray-600">Target Uniq</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-600">Employee</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-600">Channel</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-600">Category</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-600">Achievement</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={`${item.invoiceNumber}-${index}`}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-3">
                  <div className="font-medium text-gray-900">{item.location}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[120px]" title={item.siteName}>
                    {item.siteName}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="text-gray-900 truncate max-w-[180px]" title={item.skuName}>
                    {item.skuName}
                  </div>
                  <div className="text-xs text-gray-500">{item.productType}</div>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={item.qty < 0 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                    {item.qty}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className={item.sales < 0 ? 'text-red-600 font-medium' : 'text-gray-900 font-medium'}>
                    {formatCompact(item.sales)}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-gray-600">{formatCompact(item.salesTarget)}</span>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-gray-500">{formatCompact(item.salesTargetUniq)}</span>
                </td>
                <td className="py-3 px-3">
                  <div className="text-gray-900 truncate max-w-[100px]" title={item.employeeName}>
                    {item.employeeName}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[100px]" title={item.position}>
                    {item.position}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {item.channelName}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  {(() => {
                    const achievement = calculateAchievement(item.sales, item.salesTarget);
                    return (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getAchievementColor(achievement)}`}>
                        <span className={`w-2 h-2 rounded-full mr-1.5 ${getAchievementBadgeColor(achievement)}`}></span>
                        {achievement.toFixed(2)}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-gray-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {rowsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {filteredData.length > 0
              ? `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredData.length)} of ${filteredData.length}`
              : '0 entries'}
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2.5 py-1 text-sm border rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No transactions found matching your criteria.
        </div>
      )}
    </div>
  );
}
