import { GameType, GAME_NAMES } from './supabase';

// 업적 카테고리
export type AchievementCategory = 'beginner' | 'master' | 'collector' | 'streak' | 'score';

// 업적 정의
export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: {
    type: 'play_count' | 'total_score' | 'game_clear' | 'streak' | 'level' | 'single_score';
    gameType?: GameType;
    value: number;
  };
  reward: number;  // 포인트 보상
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
};

// 사용자 업적 상태
export type UserAchievement = {
  achievementId: string;
  unlockedAt: string;
  claimed: boolean;
};

const STORAGE_KEY = 'mini_games_achievements';

// 업적 목록
export const ACHIEVEMENTS: Achievement[] = [
  // 초보자 업적
  {
    id: 'first-game',
    name: '첫 발걸음',
    description: '첫 게임을 플레이하세요',
    icon: '👶',
    category: 'beginner',
    condition: { type: 'play_count', value: 1 },
    reward: 50,
    rarity: 'common',
  },
  {
    id: 'play-10',
    name: '워밍업',
    description: '게임을 10회 플레이하세요',
    icon: '🎯',
    category: 'beginner',
    condition: { type: 'play_count', value: 10 },
    reward: 100,
    rarity: 'common',
  },
  {
    id: 'play-50',
    name: '열정 게이머',
    description: '게임을 50회 플레이하세요',
    icon: '🔥',
    category: 'beginner',
    condition: { type: 'play_count', value: 50 },
    reward: 200,
    rarity: 'rare',
  },
  {
    id: 'play-100',
    name: '게임 중독',
    description: '게임을 100회 플레이하세요',
    icon: '💯',
    category: 'beginner',
    condition: { type: 'play_count', value: 100 },
    reward: 500,
    rarity: 'epic',
  },

  // 점수 업적
  {
    id: 'score-1000',
    name: '천점 돌파',
    description: '한 게임에서 1,000점 달성',
    icon: '⭐',
    category: 'score',
    condition: { type: 'single_score', value: 1000 },
    reward: 100,
    rarity: 'common',
  },
  {
    id: 'score-5000',
    name: '점수 사냥꾼',
    description: '한 게임에서 5,000점 달성',
    icon: '🌟',
    category: 'score',
    condition: { type: 'single_score', value: 5000 },
    reward: 200,
    rarity: 'rare',
  },
  {
    id: 'score-10000',
    name: '점수왕',
    description: '한 게임에서 10,000점 달성',
    icon: '👑',
    category: 'score',
    condition: { type: 'single_score', value: 10000 },
    reward: 500,
    rarity: 'epic',
  },
  {
    id: 'total-10000',
    name: '만점 수집가',
    description: '누적 점수 10,000점 달성',
    icon: '💰',
    category: 'score',
    condition: { type: 'total_score', value: 10000 },
    reward: 300,
    rarity: 'rare',
  },
  {
    id: 'total-100000',
    name: '점수 재벌',
    description: '누적 점수 100,000점 달성',
    icon: '💎',
    category: 'score',
    condition: { type: 'total_score', value: 100000 },
    reward: 1000,
    rarity: 'legendary',
  },

  // 연속 플레이 업적
  {
    id: 'streak-3',
    name: '3일 연속',
    description: '3일 연속 출석하세요',
    icon: '📅',
    category: 'streak',
    condition: { type: 'streak', value: 3 },
    reward: 100,
    rarity: 'common',
  },
  {
    id: 'streak-7',
    name: '일주일 개근',
    description: '7일 연속 출석하세요',
    icon: '🗓️',
    category: 'streak',
    condition: { type: 'streak', value: 7 },
    reward: 200,
    rarity: 'rare',
  },
  {
    id: 'streak-30',
    name: '한달 정복',
    description: '30일 연속 출석하세요',
    icon: '🏆',
    category: 'streak',
    condition: { type: 'streak', value: 30 },
    reward: 1000,
    rarity: 'legendary',
  },

  // 레벨 업적
  {
    id: 'level-5',
    name: '성장 중',
    description: '레벨 5 달성',
    icon: '📈',
    category: 'master',
    condition: { type: 'level', value: 5 },
    reward: 100,
    rarity: 'common',
  },
  {
    id: 'level-10',
    name: '마스터',
    description: '레벨 10 달성',
    icon: '🎓',
    category: 'master',
    condition: { type: 'level', value: 10 },
    reward: 300,
    rarity: 'rare',
  },
  {
    id: 'level-20',
    name: '절대자',
    description: '최대 레벨 달성',
    icon: '🌌',
    category: 'master',
    condition: { type: 'level', value: 20 },
    reward: 2000,
    rarity: 'legendary',
  },

  // 게임별 클리어 업적
  {
    id: 'clear-sudoku',
    name: '스도쿠 마스터',
    description: '스도쿠를 클리어하세요',
    icon: '🔢',
    category: 'collector',
    condition: { type: 'game_clear', gameType: 'sudoku', value: 1 },
    reward: 100,
    rarity: 'common',
  },
  {
    id: 'clear-memory',
    name: '기억력 천재',
    description: '메모리 게임을 클리어하세요',
    icon: '🧠',
    category: 'collector',
    condition: { type: 'game_clear', gameType: 'memory', value: 1 },
    reward: 100,
    rarity: 'common',
  },
  {
    id: 'clear-minesweeper',
    name: '지뢰 해체 전문가',
    description: '지뢰찾기를 클리어하세요',
    icon: '💣',
    category: 'collector',
    condition: { type: 'game_clear', gameType: 'minesweeper', value: 1 },
    reward: 100,
    rarity: 'common',
  },
];

// 희귀도별 색상
export const RARITY_COLORS: Record<Achievement['rarity'], string> = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

export const RARITY_LABELS: Record<Achievement['rarity'], string> = {
  common: '일반',
  rare: '레어',
  epic: '에픽',
  legendary: '전설',
};

// 저장된 업적 가져오기
export function getUserAchievements(): Record<string, UserAchievement> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

// 업적 저장
function saveUserAchievements(achievements: Record<string, UserAchievement>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
}

// 업적 해금
export function unlockAchievement(achievementId: string): boolean {
  const achievements = getUserAchievements();

  if (achievements[achievementId]) {
    return false; // 이미 해금됨
  }

  achievements[achievementId] = {
    achievementId,
    unlockedAt: new Date().toISOString(),
    claimed: false,
  };

  saveUserAchievements(achievements);
  return true;
}

// 업적 보상 수령
export function claimAchievementReward(achievementId: string): {
  success: boolean;
  reward?: number;
  error?: string;
} {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) {
    return { success: false, error: '업적을 찾을 수 없습니다' };
  }

  const userAchievements = getUserAchievements();
  const userAchievement = userAchievements[achievementId];

  if (!userAchievement) {
    return { success: false, error: '아직 해금되지 않은 업적입니다' };
  }

  if (userAchievement.claimed) {
    return { success: false, error: '이미 보상을 수령했습니다' };
  }

  // 보상 수령 처리
  userAchievements[achievementId] = {
    ...userAchievement,
    claimed: true,
  };
  saveUserAchievements(userAchievements);

  // 포인트는 mission.ts의 addPoints 사용
  const { addPoints } = require('./mission');
  addPoints(achievement.reward);

  return { success: true, reward: achievement.reward };
}

// 업적 상태와 함께 가져오기
export function getAchievementsWithStatus(): Array<Achievement & {
  unlocked: boolean;
  claimed: boolean;
  unlockedAt?: string;
}> {
  const userAchievements = getUserAchievements();

  return ACHIEVEMENTS.map((achievement) => {
    const userAchievement = userAchievements[achievement.id];
    return {
      ...achievement,
      unlocked: !!userAchievement,
      claimed: userAchievement?.claimed || false,
      unlockedAt: userAchievement?.unlockedAt,
    };
  });
}

// 미수령 업적 수
export function getUnclaimedAchievementCount(): number {
  const userAchievements = getUserAchievements();
  return Object.values(userAchievements).filter((a) => !a.claimed).length;
}

// 업적 진행도 체크 및 해금 (게임 플레이 후 호출)
export function checkAchievements(stats: {
  totalPlays?: number;
  totalScore?: number;
  singleScore?: number;
  streak?: number;
  level?: number;
  clearedGame?: GameType;
}): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  const userAchievements = getUserAchievements();

  for (const achievement of ACHIEVEMENTS) {
    // 이미 해금된 업적은 스킵
    if (userAchievements[achievement.id]) continue;

    let shouldUnlock = false;
    const { type, value, gameType } = achievement.condition;

    switch (type) {
      case 'play_count':
        if (stats.totalPlays && stats.totalPlays >= value) {
          shouldUnlock = true;
        }
        break;
      case 'total_score':
        if (stats.totalScore && stats.totalScore >= value) {
          shouldUnlock = true;
        }
        break;
      case 'single_score':
        if (stats.singleScore && stats.singleScore >= value) {
          shouldUnlock = true;
        }
        break;
      case 'streak':
        if (stats.streak && stats.streak >= value) {
          shouldUnlock = true;
        }
        break;
      case 'level':
        if (stats.level && stats.level >= value) {
          shouldUnlock = true;
        }
        break;
      case 'game_clear':
        if (stats.clearedGame && stats.clearedGame === gameType) {
          shouldUnlock = true;
        }
        break;
    }

    if (shouldUnlock) {
      unlockAchievement(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
