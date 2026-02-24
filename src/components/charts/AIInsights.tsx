'use client';

import { useState, useEffect } from 'react';
import type { TargetProgress, ProductSummary } from '@/lib/bigquery';

interface RAData {
  name: string;
  revenue: number;
  target?: number;
  achievement?: number;
}

interface TransactionDetail {
  siteName: string;
  employeeName: string;
  sales: number;
  category: string;
  productType: string;
  status: string;
  channelName: string;
}

interface AIInsightsProps {
  sales: number;
  target: number;
  achievement: number;
  raPerformance: RAData[];
  transactionDetails: TransactionDetail[];
  basketSize: number;
  unitPerTransaction: number;
  targetProgress?: TargetProgress;
  productInsights?: {
    topByRevenue: ProductSummary[];
    topByQuantity: ProductSummary[];
    slowMoving: ProductSummary[];
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export default function AIInsights({
  sales,
  target,
  achievement,
  raPerformance,
  transactionDetails,
  basketSize,
  unitPerTransaction,
  targetProgress,
  productInsights,
}: AIInsightsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const PREVIEW_COUNT = 5;

  useEffect(() => {
    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      const generatedInsights = generateInsights();
      setInsights(generatedInsights);
      setIsAnalyzing(false);
    }, 1500);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales, target, achievement, raPerformance, transactionDetails]);

  const generateInsights = (): string[] => {
    const results: string[] = [];

    // 1. Achievement Analysis (with variations)
    if (achievement >= 100) {
      results.push(pick([
        `🎯 Target tercapai! Achievement ${achievement.toFixed(1)}% menunjukkan performa excellent. Pertahankan momentum ini.`,
        `🎯 Luar biasa! Achievement ${achievement.toFixed(1)}% — tim berhasil melampaui target. Konsistensi ini perlu dipertahankan.`,
        `🎯 Achievement ${achievement.toFixed(1)}% — target terlampaui! Evaluasi strategi yang berhasil untuk direplikasi bulan depan.`,
      ]));
    } else if (achievement >= 80) {
      const gap = target - sales;
      results.push(pick([
        `📊 Achievement ${achievement.toFixed(1)}% — performa baik namun masih ada gap ${formatCurrency(gap)}. Fokus pada upselling untuk menutup gap.`,
        `📊 Tinggal sedikit lagi! Achievement ${achievement.toFixed(1)}% dengan sisa gap ${formatCurrency(gap)}. Push final di hari-hari tersisa bisa menutup gap ini.`,
        `📊 Achievement ${achievement.toFixed(1)}% mendekati target. Gap ${formatCurrency(gap)} bisa ditutup dengan fokus pada high-value transactions.`,
      ]));
    } else if (achievement >= 60) {
      results.push(pick([
        `⚠️ Achievement ${achievement.toFixed(1)}% di bawah ekspektasi. Perlu strategi akselerasi penjualan segera.`,
        `⚠️ Perhatian: Achievement ${achievement.toFixed(1)}%. Identifikasi bottleneck dan buat action plan percepatan.`,
      ]));
    } else {
      results.push(pick([
        `🚨 Achievement ${achievement.toFixed(1)}% sangat rendah. Evaluasi menyeluruh diperlukan untuk identifikasi masalah.`,
        `🚨 Alert: Achievement ${achievement.toFixed(1)}%. Perlu intervensi segera — review strategi, traffic, dan konversi.`,
      ]));
    }

    // 2. Run Rate Insight (NEW)
    if (targetProgress) {
      const projected = targetProgress.projectedAchievement;
      if (projected >= 100) {
        results.push(pick([
          `🚀 Dengan daily rate ${formatCurrency(targetProgress.dailySalesRate)}, projected achievement ${projected.toFixed(1)}%. Tim on track untuk melampaui target!`,
          `🚀 Run rate saat ini ${formatCurrency(targetProgress.dailySalesRate)}/hari — proyeksi akhir periode ${projected.toFixed(1)}%. Mantap!`,
        ]));
      } else {
        results.push(pick([
          `📈 Daily rate saat ini ${formatCurrency(targetProgress.dailySalesRate)}, tapi butuh ${formatCurrency(targetProgress.requiredDailyRate)}/hari untuk achieve. Tingkatkan intensitas!`,
          `📈 Projected achievement ${projected.toFixed(1)}% berdasarkan run rate ${formatCurrency(targetProgress.dailySalesRate)}/hari. Perlu boost ke ${formatCurrency(targetProgress.requiredDailyRate)}/hari.`,
        ]));
      }
    }

    // 3. Top Performer Analysis
    if (raPerformance.length > 0) {
      const topRA = raPerformance[0];
      const avgRevenue = raPerformance.reduce((sum, ra) => sum + ra.revenue, 0) / raPerformance.length;
      const topPerformanceRatio = ((topRA.revenue / avgRevenue) * 100 - 100).toFixed(0);

      results.push(pick([
        `⭐ Top performer: ${topRA.name} dengan revenue ${formatCurrency(topRA.revenue)} (${topPerformanceRatio}% di atas rata-rata). Pelajari teknik penjualannya untuk diterapkan tim lain.`,
        `⭐ ${topRA.name} memimpin dengan ${formatCurrency(topRA.revenue)} — ${topPerformanceRatio}% lebih tinggi dari rata-rata tim. Best practice-nya bisa jadi referensi.`,
      ]));
    }

    // 4. RA Gap Analysis (NEW)
    if (raPerformance.length > 2) {
      const topRA = raPerformance[0];
      const bottomRA = raPerformance[raPerformance.length - 1];
      const gap = topRA.revenue - bottomRA.revenue;

      if (bottomRA.revenue < topRA.revenue * 0.3) {
        results.push(pick([
          `📉 Gap antara top (${topRA.name}) dan bottom performer (${bottomRA.name}): ${formatCurrency(gap)}. Pertimbangkan knowledge sharing session.`,
          `📉 Disparitas performa signifikan: ${topRA.name} vs ${bottomRA.name} gap ${formatCurrency(gap)}. Coaching dari top performer bisa membantu pemerataan.`,
        ]));
      }
    }

    // 5. Product Concentration (NEW)
    if (productInsights && productInsights.topByRevenue.length >= 3) {
      const top3Revenue = productInsights.topByRevenue.slice(0, 3).reduce((sum, p) => sum + p.totalRevenue, 0);
      const totalRevenue = productInsights.topByRevenue.reduce((sum, p) => sum + p.totalRevenue, 0);
      const concentration = totalRevenue > 0 ? ((top3Revenue / totalRevenue) * 100).toFixed(0) : '0';

      if (Number(concentration) > 50) {
        results.push(pick([
          `🏷️ Top 3 SKU berkontribusi ${concentration}% total revenue. Konsentrasi tinggi — diversifikasi produk bisa mengurangi risiko.`,
          `🏷️ Revenue terkonsentrasi: 3 produk teratas menyumbang ${concentration}%. Dorong penjualan produk lain untuk diversifikasi.`,
        ]));
      } else {
        results.push(`🏷️ Distribusi revenue cukup merata — top 3 SKU berkontribusi ${concentration}%. Portofolio produk sehat.`);
      }
    }

    // 6. Avg. Order Value Analysis
    if (basketSize > 0) {
      if (basketSize >= 500000) {
        results.push(pick([
          `🛒 Rata-rata nilai order ${formatCurrency(basketSize)} sangat baik! Strategi bundling dan cross-selling berjalan efektif.`,
          `🛒 Avg. order value ${formatCurrency(basketSize)} — customer value tinggi. Pertahankan program bundling yang berjalan.`,
        ]));
      } else if (basketSize >= 300000) {
        results.push(pick([
          `🛒 Rata-rata nilai order ${formatCurrency(basketSize)} cukup baik. Tingkatkan dengan program "add-on" produk pelengkap.`,
          `🛒 Avg. order value ${formatCurrency(basketSize)} — ada potensi naik. Coba suggestive selling untuk produk pelengkap.`,
        ]));
      } else {
        results.push(pick([
          `🛒 Rata-rata nilai order ${formatCurrency(basketSize)} masih bisa ditingkatkan. Rekomendasikan produk komplementer saat checkout.`,
          `🛒 Avg. order value ${formatCurrency(basketSize)} di bawah ideal. Strategi upselling bisa mendongkrak nilai transaksi.`,
        ]));
      }
    }

    // 7. Avg. Items per Order
    if (unitPerTransaction > 0) {
      if (unitPerTransaction >= 2) {
        results.push(pick([
          `📦 Rata-rata ${unitPerTransaction.toFixed(2)} item/order menunjukkan customer membeli multiple items. Pertahankan dengan display produk yang menarik.`,
          `📦 Avg. ${unitPerTransaction.toFixed(2)} item/order — pelanggan cenderung beli lebih dari 1 item. Visual merchandising berjalan baik.`,
        ]));
      } else {
        results.push(pick([
          `📦 Rata-rata ${unitPerTransaction.toFixed(2)} item/order — peluang untuk meningkatkan dengan promo "Buy 2 Get Discount" atau paket bundling.`,
          `📦 Avg. ${unitPerTransaction.toFixed(2)} item/order masih single-item oriented. Program bundle pricing bisa mendorong multi-item purchase.`,
        ]));
      }
    }

    // 8. Category Analysis from transactions
    const positiveTransactions = transactionDetails.filter(t => t.sales > 0);
    if (positiveTransactions.length > 0) {
      const categoryCount = new Map<string, number>();
      positiveTransactions.forEach(t => {
        categoryCount.set(t.category, (categoryCount.get(t.category) || 0) + 1);
      });

      const topCategory = Array.from(categoryCount.entries())
        .sort((a, b) => b[1] - a[1])[0];

      if (topCategory) {
        results.push(pick([
          `👕 Kategori terlaris: ${topCategory[0]} dengan ${topCategory[1]} transaksi. Pastikan stok kategori ini selalu tersedia.`,
          `👕 ${topCategory[0]} mendominasi dengan ${topCategory[1]} transaksi. Prioritaskan availability dan display untuk kategori ini.`,
        ]));
      }
    }

    // 9. Channel Analysis
    const channelRevenue = new Map<string, number>();
    positiveTransactions.forEach(t => {
      channelRevenue.set(t.channelName, (channelRevenue.get(t.channelName) || 0) + t.sales);
    });

    const topChannel = Array.from(channelRevenue.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (topChannel) {
      const channelPercentage = ((topChannel[1] / sales) * 100).toFixed(0);
      results.push(`🏪 Channel ${topChannel[0]} berkontribusi ${channelPercentage}% dari total sales. ${topChannel[0] === 'Direct' ? 'Tingkatkan traffic toko dengan promo weekend.' : 'Optimalkan channel online untuk jangkauan lebih luas.'}`);
    }

    // 10. Return Rate Analysis
    const returns = transactionDetails.filter(t => t.sales < 0);
    if (returns.length > 0 && positiveTransactions.length > 0) {
      const returnRate = ((returns.length / (returns.length + positiveTransactions.length)) * 100).toFixed(1);
      if (parseFloat(returnRate) > 10) {
        results.push(`🔄 Return rate ${returnRate}% cukup tinggi. Analisis penyebab return untuk perbaikan (sizing, kualitas, ekspektasi customer).`);
      }
    }

    return results;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          <p className="text-sm text-gray-500">Analisis otomatis dari data penjualan</p>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="flex items-center gap-3 py-8">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          <span className="text-gray-600">Menganalisis data...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {(expanded ? insights : insights.slice(0, PREVIEW_COUNT)).map((insight, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
            </div>
          ))}

          {insights.length > PREVIEW_COUNT && (
            <button
              onClick={() => setExpanded(prev => !prev)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {expanded ? (
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
                  Tampilkan {insights.length - PREVIEW_COUNT} insight lainnya
                </>
              )}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-indigo-100">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Insights dihasilkan berdasarkan analisis data real-time
        </p>
      </div>
    </div>
  );
}
