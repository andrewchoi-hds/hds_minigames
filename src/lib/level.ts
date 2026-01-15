import { getUserPoints } from './mission';

// 레벨 설정
export const LEVEL_CONFIG = {
  // 레벨별 필요 경험치 (누적)
  THRESHOLDS: [
    0,      // Lv.1: 0
    100,    // Lv.2: 100
    300,    // Lv.3: 300
    600,    // Lv.4: 600
    1000,   // Lv.5: 1000
    1500,   // Lv.6: 1500
    2200,   // Lv.7: 2200
    3000,   // Lv.8: 3000
    4000,   // Lv.9: 4000
    5200,   // Lv.10: 5200
    6600,   // Lv.11: 6600
    8200,   // Lv.12: 8200
    10000,  // Lv.13: 10000
    12000,  // Lv.14: 12000
    14500,  // Lv.15: 14500
    17500,  // Lv.16: 17500
    21000,  // Lv.17: 21000
    25000,  // Lv.18: 25000
    30000,  // Lv.19: 30000
    36000,  // Lv.20: 36000
  ],
  MAX_LEVEL: 20,
};

// 레벨별 칭호
export const LEVEL_TITLES: Record<number, string> = {
  1: '뉴비',
  2: '초보자',
  3: '도전자',
  4: '열정러',
  5: '게이머',
  6: '실력자',
  7: '숙련자',
  8: '전문가',
  9: '달인',
  10: '마스터',
  11: '그랜드마스터',
  12: '챔피언',
  13: '레전드',
  14: '영웅',
  15: '전설',
  16: '신화',
  17: '초월자',
  18: '정복자',
  19: '지배자',
  20: '절대자',
};

// 레벨별 아이콘
export const LEVEL_ICONS: Record<number, string> = {
  1: '🌱',
  2: '🌿',
  3: '🍀',
  4: '🔥',
  5: '⭐',
  6: '🌟',
  7: '💫',
  8: '✨',
  9: '💎',
  10: '👑',
  11: '🏆',
  12: '🎖️',
  13: '🏅',
  14: '⚔️',
  15: '🛡️',
  16: '🔮',
  17: '🌈',
  18: '🌙',
  19: '☀️',
  20: '🌌',
};

export type LevelInfo = {
  level: number;
  title: string;
  icon: string;
  currentExp: number;
  requiredExp: number;
  nextLevelExp: number;
  progress: number;  // 0-100
  isMaxLevel: boolean;
};

// 포인트로 레벨 계산
export function calculateLevel(points: number): number {
  const thresholds = LEVEL_CONFIG.THRESHOLDS;

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (points >= thresholds[i]) {
      return i + 1;
    }
  }

  return 1;
}

// 현재 레벨 정보 가져오기
export function getLevelInfo(points?: number): LevelInfo {
  const currentPoints = points ?? getUserPoints();
  const level = calculateLevel(currentPoints);
  const isMaxLevel = level >= LEVEL_CONFIG.MAX_LEVEL;

  const currentThreshold = LEVEL_CONFIG.THRESHOLDS[level - 1] || 0;
  const nextThreshold = isMaxLevel
    ? LEVEL_CONFIG.THRESHOLDS[level - 1]
    : LEVEL_CONFIG.THRESHOLDS[level] || currentThreshold;

  const expInCurrentLevel = currentPoints - currentThreshold;
  const expNeededForNextLevel = nextThreshold - currentThreshold;
  const progress = isMaxLevel
    ? 100
    : Math.min(100, Math.floor((expInCurrentLevel / expNeededForNextLevel) * 100));

  return {
    level,
    title: LEVEL_TITLES[level] || '???',
    icon: LEVEL_ICONS[level] || '❓',
    currentExp: currentPoints,
    requiredExp: currentThreshold,
    nextLevelExp: nextThreshold,
    progress,
    isMaxLevel,
  };
}

// 다음 레벨까지 필요한 포인트
export function getExpToNextLevel(points?: number): number {
  const currentPoints = points ?? getUserPoints();
  const level = calculateLevel(currentPoints);

  if (level >= LEVEL_CONFIG.MAX_LEVEL) {
    return 0;
  }

  const nextThreshold = LEVEL_CONFIG.THRESHOLDS[level] || 0;
  return Math.max(0, nextThreshold - currentPoints);
}

// 특정 레벨의 정보
export function getLevelDetails(level: number): {
  title: string;
  icon: string;
  requiredExp: number;
} {
  const clampedLevel = Math.min(Math.max(1, level), LEVEL_CONFIG.MAX_LEVEL);
  return {
    title: LEVEL_TITLES[clampedLevel] || '???',
    icon: LEVEL_ICONS[clampedLevel] || '❓',
    requiredExp: LEVEL_CONFIG.THRESHOLDS[clampedLevel - 1] || 0,
  };
}
