'use client';

import { memo } from 'react';
import { LevelInfo, LEVEL_ICONS, LEVEL_TITLES } from '@/lib/level';

type Props = {
  levelInfo: LevelInfo;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  showProgress?: boolean;
  animate?: boolean;
};

// 레벨 티어 결정 (시각적 화려함 정도)
function getLevelTier(level: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary' {
  if (level <= 3) return 'bronze';
  if (level <= 6) return 'silver';
  if (level <= 10) return 'gold';
  if (level <= 14) return 'platinum';
  if (level <= 18) return 'diamond';
  return 'legendary';
}

// 티어별 스타일
const TIER_STYLES = {
  bronze: {
    bg: 'bg-gradient-to-br from-amber-600 to-amber-800',
    border: 'border-amber-500',
    text: 'text-amber-100',
    glow: '',
    animation: '',
  },
  silver: {
    bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
    border: 'border-gray-300',
    text: 'text-gray-900',
    glow: 'shadow-lg shadow-gray-400/30',
    animation: '',
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600',
    border: 'border-yellow-400',
    text: 'text-yellow-900',
    glow: 'shadow-lg shadow-yellow-500/40',
    animation: 'animate-pulse',
  },
  platinum: {
    bg: 'bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500',
    border: 'border-cyan-300',
    text: 'text-white',
    glow: 'shadow-xl shadow-cyan-500/50',
    animation: '',
  },
  diamond: {
    bg: 'bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500',
    border: 'border-purple-300',
    text: 'text-white',
    glow: 'shadow-xl shadow-purple-500/60',
    animation: '',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-amber-400 via-rose-500 via-purple-500 to-indigo-500',
    border: 'border-amber-300',
    text: 'text-white',
    glow: 'shadow-2xl shadow-amber-500/70',
    animation: '',
  },
};

// 사이즈별 클래스
const SIZE_CLASSES = {
  sm: {
    container: 'px-2 py-1',
    icon: 'text-sm',
    level: 'text-xs',
    title: 'text-xs',
  },
  md: {
    container: 'px-3 py-1.5',
    icon: 'text-lg',
    level: 'text-sm',
    title: 'text-sm',
  },
  lg: {
    container: 'px-4 py-2',
    icon: 'text-2xl',
    level: 'text-base',
    title: 'text-base',
  },
};

const LevelBadge = memo(function LevelBadge({
  levelInfo,
  size = 'md',
  showTitle = true,
  showProgress = false,
  animate = true,
}: Props) {
  const tier = getLevelTier(levelInfo.level);
  const styles = TIER_STYLES[tier];
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* 메인 뱃지 */}
      <div
        className={`
          relative inline-flex items-center gap-1.5 rounded-full border-2
          ${styles.bg} ${styles.border} ${styles.text} ${styles.glow}
          ${sizeClasses.container}
          ${animate && tier === 'legendary' ? 'animate-[shimmer_2s_ease-in-out_infinite]' : ''}
          transition-all duration-300
        `}
      >
        {/* 레전더리 배경 효과 */}
        {tier === 'legendary' && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
        )}

        {/* 다이아몬드 반짝임 효과 */}
        {tier === 'diamond' && animate && (
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-50 blur-sm animate-pulse" />
        )}

        {/* 아이콘 */}
        <span className={`${sizeClasses.icon} relative z-10`}>
          {LEVEL_ICONS[levelInfo.level]}
        </span>

        {/* 레벨 */}
        <span className={`font-bold ${sizeClasses.level} relative z-10`}>
          Lv.{levelInfo.level}
        </span>

        {/* 칭호 */}
        {showTitle && (
          <span className={`font-medium ${sizeClasses.title} relative z-10 hidden sm:inline`}>
            {LEVEL_TITLES[levelInfo.level]}
          </span>
        )}
      </div>

      {/* 경험치 바 */}
      {showProgress && !levelInfo.isMaxLevel && (
        <div className="mt-1 w-full max-w-[100px]">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${styles.bg} transition-all duration-500`}
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

// 컴팩트 버전 (랭킹 행에 사용)
export const LevelBadgeCompact = memo(function LevelBadgeCompact({
  level,
  animate = true,
}: {
  level: number;
  animate?: boolean;
}) {
  const tier = getLevelTier(level);
  const styles = TIER_STYLES[tier];

  return (
    <span
      className={`
        inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-bold
        ${styles.bg} ${styles.text}
        ${tier === 'legendary' && animate ? 'animate-[shimmer_2s_ease-in-out_infinite]' : ''}
        ${tier === 'gold' && animate ? 'animate-pulse' : ''}
      `}
    >
      <span>{LEVEL_ICONS[level]}</span>
      <span>{level}</span>
    </span>
  );
});

// 대형 프로필용 뱃지
export const LevelBadgeLarge = memo(function LevelBadgeLarge({
  levelInfo,
  animate = true,
}: {
  levelInfo: LevelInfo;
  animate?: boolean;
}) {
  const tier = getLevelTier(levelInfo.level);
  const styles = TIER_STYLES[tier];

  return (
    <div className="relative">
      {/* 외부 글로우 효과 */}
      {(tier === 'diamond' || tier === 'legendary') && (
        <div
          className={`absolute -inset-2 rounded-2xl blur-lg opacity-60 ${
            tier === 'legendary'
              ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 animate-pulse'
              : 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500'
          }`}
        />
      )}

      <div
        className={`
          relative flex flex-col items-center p-4 rounded-2xl border-2
          ${styles.bg} ${styles.border} ${styles.text} ${styles.glow}
          ${animate && tier === 'legendary' ? 'animate-[shimmer_3s_ease-in-out_infinite]' : ''}
        `}
      >
        {/* 아이콘 */}
        <div className={`text-4xl mb-2 ${tier === 'legendary' ? 'animate-bounce' : ''}`}>
          {LEVEL_ICONS[levelInfo.level]}
        </div>

        {/* 레벨 */}
        <div className="text-2xl font-black">Lv.{levelInfo.level}</div>

        {/* 칭호 */}
        <div className="text-lg font-bold mt-1">{LEVEL_TITLES[levelInfo.level]}</div>

        {/* 경험치 */}
        {!levelInfo.isMaxLevel && (
          <div className="mt-3 w-full">
            <div className="flex justify-between text-xs mb-1 opacity-80">
              <span>{levelInfo.currentExp.toLocaleString()} XP</span>
              <span>{levelInfo.nextLevelExp.toLocaleString()} XP</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
          </div>
        )}

        {levelInfo.isMaxLevel && (
          <div className="mt-2 text-sm font-bold opacity-80">MAX LEVEL</div>
        )}
      </div>
    </div>
  );
});

export default LevelBadge;
