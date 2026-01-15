import { GameType } from '@/lib/supabase';

// 미션 타입 정의
export type MissionType = 'daily' | 'weekly' | 'achievement';

export type MissionTargetType =
  | 'play_count'      // 게임 플레이 횟수
  | 'score'           // 특정 점수 달성
  | 'win'             // 게임 클리어
  | 'streak'          // 연속 플레이
  | 'total_score';    // 누적 점수

export type Mission = {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  targetType: MissionTargetType;
  targetValue: number;
  gameType?: GameType;       // 특정 게임 미션 (없으면 전체)
  rewardPoints: number;
  icon: string;
};

export type UserMission = {
  missionId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
  claimedAt?: string;        // 보상 수령 시간
};

// 일일 미션 정의
export const DAILY_MISSIONS: Mission[] = [
  {
    id: 'daily-play-3',
    title: '게임 3회 플레이',
    description: '아무 게임이나 3회 플레이하세요',
    type: 'daily',
    targetType: 'play_count',
    targetValue: 3,
    rewardPoints: 50,
    icon: '🎮',
  },
  {
    id: 'daily-2048-500',
    title: '2048 도전',
    description: '2048에서 500점 이상 달성하세요',
    type: 'daily',
    targetType: 'score',
    targetValue: 500,
    gameType: 'puzzle2048',
    rewardPoints: 30,
    icon: '🔢',
  },
  {
    id: 'daily-memory-win',
    title: '메모리 클리어',
    description: '메모리 게임을 클리어하세요',
    type: 'daily',
    targetType: 'win',
    targetValue: 1,
    gameType: 'memory',
    rewardPoints: 40,
    icon: '🧠',
  },
  {
    id: 'daily-typing-100',
    title: '타이핑 마스터',
    description: '타이핑 게임에서 100점 이상 달성',
    type: 'daily',
    targetType: 'score',
    targetValue: 100,
    gameType: 'typing',
    rewardPoints: 30,
    icon: '⌨️',
  },
  {
    id: 'daily-reaction-300',
    title: '번개 반응',
    description: '반응속도 테스트에서 평균 300ms 이하 달성',
    type: 'daily',
    targetType: 'score',
    targetValue: 7000, // 10000 - 300*10 = 7000점 이상
    gameType: 'reaction',
    rewardPoints: 50,
    icon: '⚡',
  },
];

// 주간 미션 정의
export const WEEKLY_MISSIONS: Mission[] = [
  {
    id: 'weekly-play-20',
    title: '주간 게이머',
    description: '이번 주에 20회 게임 플레이',
    type: 'weekly',
    targetType: 'play_count',
    targetValue: 20,
    rewardPoints: 200,
    icon: '🏆',
  },
  {
    id: 'weekly-all-games',
    title: '올라운더',
    description: '5개 이상의 다른 게임 플레이',
    type: 'weekly',
    targetType: 'play_count',
    targetValue: 5,
    rewardPoints: 150,
    icon: '🌟',
  },
  {
    id: 'weekly-score-10000',
    title: '점수왕',
    description: '주간 누적 점수 10,000점 달성',
    type: 'weekly',
    targetType: 'total_score',
    targetValue: 10000,
    rewardPoints: 300,
    icon: '👑',
  },
];

// 오늘의 미션 가져오기 (3개 랜덤 선택)
export function getTodayMissions(): Mission[] {
  // 날짜 기반 시드로 일관된 랜덤 선택
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, n) => acc + parseInt(n), 0);

  const shuffled = [...DAILY_MISSIONS].sort((a, b) => {
    const hashA = (seed * a.id.length) % 100;
    const hashB = (seed * b.id.length) % 100;
    return hashA - hashB;
  });

  return shuffled.slice(0, 3);
}

// 이번 주 미션 가져오기
export function getWeeklyMissions(): Mission[] {
  return WEEKLY_MISSIONS;
}

// 모든 미션 가져오기
export function getAllMissions(): Mission[] {
  return [...DAILY_MISSIONS, ...WEEKLY_MISSIONS];
}

// 미션 ID로 미션 찾기
export function getMissionById(id: string): Mission | undefined {
  return getAllMissions().find((m) => m.id === id);
}
