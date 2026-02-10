'use client';

import type { TargetProgress } from '@/lib/bigquery';

interface AchievementHeroProps {
  achievement: number;
  sales: number;
  target: number;
  targetProgress: TargetProgress;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(0)}K`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const formatCurrencyFull = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AchievementHero({ achievement, sales, target, targetProgress }: AchievementHeroProps) {
  const clampedAchievement = Math.min(achievement, 100);
  const gap = target - sales;

  const getGradient = () => {
    if (achievement >= 100) return 'from-emerald-600 via-emerald-500 to-green-400';
    if (achievement >= 80) return 'from-blue-600 via-blue-500 to-cyan-400';
    if (achievement >= 60) return 'from-amber-600 via-yellow-500 to-orange-400';
    return 'from-red-600 via-red-500 to-rose-400';
  };

  const getProgressBg = () => {
    if (achievement >= 100) return 'bg-emerald-300/40';
    if (achievement >= 80) return 'bg-blue-300/40';
    if (achievement >= 60) return 'bg-amber-300/40';
    return 'bg-red-300/40';
  };

  const getProgressFill = () => {
    if (achievement >= 100) return 'bg-white';
    if (achievement >= 80) return 'bg-white';
    if (achievement >= 60) return 'bg-white';
    return 'bg-white';
  };

  return (
    <div className={`bg-gradient-to-r ${getGradient()} rounded-2xl shadow-lg p-6 sm:p-8 text-white`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Achievement */}
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Target Achievement</p>
          <p className="text-white/60 text-xs mb-1">
            Per {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; Hari ke-{targetProgress.daysElapsed} dari {targetProgress.daysTotal}
          </p>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-5xl sm:text-6xl font-bold">{achievement.toFixed(1)}%</span>
            {achievement >= 100 ? (
              <span className="text-lg font-medium bg-white/20 px-3 py-1 rounded-full">On Target</span>
            ) : (
              <span className="text-lg font-medium bg-white/20 px-3 py-1 rounded-full">
                Gap {formatCurrency(Math.abs(gap))}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className={`w-full ${getProgressBg()} rounded-full h-4 mb-4`}>
            <div
              className={`h-4 rounded-full ${getProgressFill()} transition-all duration-1000 ease-out`}
              style={{ width: `${clampedAchievement}%`, opacity: 0.9 }}
            />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-white/70">Sales: </span>
              <span className="font-semibold">{formatCurrencyFull(sales)}</span>
            </div>
            <div>
              <span className="text-white/70">Target: </span>
              <span className="font-semibold">{formatCurrencyFull(target)}</span>
            </div>
          </div>
        </div>

        {/* Right: Run Rate Stats */}
        <div className="grid grid-cols-2 gap-3 lg:w-80">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-white/70 text-xs mb-1">Daily Rate</p>
            <p className="text-lg font-bold">{formatCurrency(targetProgress.dailySalesRate)}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-white/70 text-xs mb-1">Required Rate</p>
            <p className="text-lg font-bold">{formatCurrency(targetProgress.requiredDailyRate)}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-white/70 text-xs mb-1">Projected</p>
            <p className="text-lg font-bold">{targetProgress.projectedAchievement.toFixed(1)}%</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-white/70 text-xs mb-1">Days Left</p>
            <p className="text-lg font-bold">{targetProgress.daysRemaining}</p>
            <p className="text-white/60 text-xs">of {targetProgress.daysTotal}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
