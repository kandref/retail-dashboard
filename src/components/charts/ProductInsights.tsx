'use client';

import { useState, useMemo } from 'react';
import type { ProductSummary } from '@/lib/bigquery';
import ExportButton from './ExportButton';

interface ProductInsightsProps {
  topByRevenue: ProductSummary[];
  topByQuantity: ProductSummary[];
  slowMoving: ProductSummary[];
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
  return value.toLocaleString('id-ID');
};

type Tab = 'revenue' | 'quantity' | 'slow';

export default function ProductInsights({ topByRevenue, topByQuantity, slowMoving }: ProductInsightsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('revenue');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'revenue', label: 'Top Revenue' },
    { key: 'quantity', label: 'Top Qty' },
    { key: 'slow', label: 'Slow Moving' },
  ];

  const getData = (): ProductSummary[] => {
    switch (activeTab) {
      case 'revenue': return topByRevenue;
      case 'quantity': return topByQuantity;
      case 'slow': return slowMoving;
    }
  };

  const data = getData();

  const exportData = useMemo(() => data.map((p, idx) => ({
    Rank: idx + 1,
    SKU: p.skuName,
    Category: p.category,
    'Product Type': p.productType,
    Revenue: p.totalRevenue,
    Qty: Math.round(p.totalQty),
    Transactions: p.transactionCount,
  })), [data]);

  const exportColumns = [
    { key: 'Rank', header: 'Rank' },
    { key: 'SKU', header: 'SKU' },
    { key: 'Category', header: 'Category' },
    { key: 'Product Type', header: 'Product Type' },
    { key: 'Revenue', header: 'Revenue' },
    { key: 'Qty', header: 'Qty' },
    { key: 'Transactions', header: 'Transactions' },
  ];

  const tabLabel = activeTab === 'revenue' ? 'Top Revenue' : activeTab === 'quantity' ? 'Top Quantity' : 'Slow Moving';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Product Insights</h3>
        <ExportButton data={exportData} columns={exportColumns} fileName={`product-insights-${activeTab}`} title={`Product Insights - ${tabLabel}`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {data.map((product, idx) => (
          <div
            key={product.skuName}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              activeTab === 'slow' ? 'bg-red-50 border border-red-100' : 'bg-gray-50'
            }`}
          >
            <span className={`text-sm font-bold w-6 text-center flex-shrink-0 ${
              activeTab === 'slow' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{product.skuName}</p>
              <p className="text-xs text-gray-500">
                {product.category} · {product.productType}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-semibold ${activeTab === 'slow' ? 'text-red-600' : 'text-gray-900'}`}>
                Rp {formatCurrency(product.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500">{Math.round(product.totalQty)} pcs</p>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No data available</p>
        )}
      </div>
    </div>
  );
}
