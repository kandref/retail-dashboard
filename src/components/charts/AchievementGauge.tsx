'use client';

interface AchievementGaugeProps {
  achievement: number;
  sales: number;
  target: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AchievementGauge({ achievement, sales, target }: AchievementGaugeProps) {
  const clampedAchievement = Math.min(achievement, 100);
  const progressColor =
    achievement >= 100 ? 'bg-green-500' : achievement >= 80 ? 'bg-blue-500' : achievement >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-[26rem]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Achievement</h3>

      <div className="flex items-center justify-center mb-8">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="14"
            />
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke={achievement >= 100 ? '#22c55e' : achievement >= 80 ? '#3b82f6' : achievement >= 60 ? '#eab308' : '#ef4444'}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${clampedAchievement * 5.34} 534`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{achievement.toFixed(1)}%</span>
            <span className="text-xs text-gray-500">Achievement</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Sales</span>
          <span className="font-semibold text-gray-900">{formatCurrency(sales)}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${progressColor} transition-all duration-500`}
            style={{ width: `${clampedAchievement}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Target</span>
          <span className="font-semibold text-gray-900">{formatCurrency(target)}</span>
        </div>
      </div>
    </div>
  );
}
