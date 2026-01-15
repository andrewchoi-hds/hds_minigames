import { GameType } from './supabase';
import {
  Mission,
  UserMission,
  getTodayMissions,
  getWeeklyMissions,
  getMissionById,
} from './data/missions';
import { getLocalUser } from './auth';

const STORAGE_KEYS = {
  USER_MISSIONS: 'mini_games_user_missions',
  USER_POINTS: 'mini_games_user_points',
  LAST_RESET_DATE: 'mini_games_last_reset_date',
  LAST_RESET_WEEK: 'mini_games_last_reset_week',
  PLAY_HISTORY: 'mini_games_play_history',
};

// 현재 주 번호 계산
function getWeekNumber(date: Date): number {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + firstDay.getDay() + 1) / 7);
}

// 오늘 날짜 문자열
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// localStorage에서 직접 미션 데이터 가져오기 (재귀 방지용)
function getRawUserMissions(): Record<string, UserMission> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(STORAGE_KEYS.USER_MISSIONS);
  return data ? JSON.parse(data) : {};
}

// 미션 리셋 체크 (일일/주간)
function checkAndResetMissions(): void {
  if (typeof window === 'undefined') return;

  const today = getTodayString();
  const currentWeek = getWeekNumber(new Date());

  const lastResetDate = localStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);
  const lastResetWeek = localStorage.getItem(STORAGE_KEYS.LAST_RESET_WEEK);

  // 일일 미션 리셋
  if (lastResetDate !== today) {
    const missions = getRawUserMissions();

    // 일일 미션만 리셋
    const resetMissions = Object.fromEntries(
      Object.entries(missions).filter(([id]) => !id.startsWith('daily-'))
    );

    localStorage.setItem(STORAGE_KEYS.USER_MISSIONS, JSON.stringify(resetMissions));
    localStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, today);

    // 플레이 히스토리도 리셋
    localStorage.setItem(STORAGE_KEYS.PLAY_HISTORY, JSON.stringify({ date: today, games: {} }));
  }

  // 주간 미션 리셋
  if (lastResetWeek !== String(currentWeek)) {
    const missions = getRawUserMissions();
    const resetMissions = Object.fromEntries(
      Object.entries(missions).filter(([id]) => !id.startsWith('weekly-'))
    );

    localStorage.setItem(STORAGE_KEYS.USER_MISSIONS, JSON.stringify(resetMissions));
    localStorage.setItem(STORAGE_KEYS.LAST_RESET_WEEK, String(currentWeek));
  }
}

// 사용자 미션 진행 가져오기
export function getUserMissions(): Record<string, UserMission> {
  if (typeof window === 'undefined') return {};

  checkAndResetMissions();

  const data = localStorage.getItem(STORAGE_KEYS.USER_MISSIONS);
  return data ? JSON.parse(data) : {};
}

// 사용자 미션 진행 저장
function saveUserMissions(missions: Record<string, UserMission>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER_MISSIONS, JSON.stringify(missions));
}

// 사용자 포인트 가져오기
export function getUserPoints(): number {
  if (typeof window === 'undefined') return 0;

  const data = localStorage.getItem(STORAGE_KEYS.USER_POINTS);
  return data ? parseInt(data, 10) : 0;
}

// 포인트 추가
export function addPoints(amount: number): number {
  if (typeof window === 'undefined') return 0;

  const current = getUserPoints();
  const newTotal = current + amount;
  localStorage.setItem(STORAGE_KEYS.USER_POINTS, String(newTotal));
  return newTotal;
}

// 플레이 히스토리 가져오기
function getPlayHistory(): { date: string; games: Record<string, number> } {
  if (typeof window === 'undefined') return { date: '', games: {} };

  const today = getTodayString();
  const data = localStorage.getItem(STORAGE_KEYS.PLAY_HISTORY);

  if (!data) {
    return { date: today, games: {} };
  }

  const history = JSON.parse(data);

  // 날짜가 다르면 리셋
  if (history.date !== today) {
    return { date: today, games: {} };
  }

  return history;
}

// 플레이 히스토리 저장
function savePlayHistory(history: { date: string; games: Record<string, number> }): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PLAY_HISTORY, JSON.stringify(history));
}

// 게임 플레이 기록 (미션 진행 업데이트)
export function recordGamePlay(params: {
  gameType: GameType;
  score: number;
  won?: boolean;
}): { updatedMissions: string[]; completedMissions: Mission[] } {
  checkAndResetMissions();

  const { gameType, score, won } = params;
  const updatedMissions: string[] = [];
  const completedMissions: Mission[] = [];

  // 플레이 히스토리 업데이트
  const history = getPlayHistory();
  history.games[gameType] = (history.games[gameType] || 0) + 1;
  savePlayHistory(history);

  // 총 플레이 횟수
  const totalPlays = Object.values(history.games).reduce((a, b) => a + b, 0);
  // 다른 게임 수
  const uniqueGames = Object.keys(history.games).length;

  // 모든 미션 체크
  const allMissions = [...getTodayMissions(), ...getWeeklyMissions()];
  const userMissions = getUserMissions();

  for (const mission of allMissions) {
    // 이미 완료된 미션은 스킵
    if (userMissions[mission.id]?.completed) continue;

    // 특정 게임 미션인데 다른 게임이면 스킵
    if (mission.gameType && mission.gameType !== gameType) continue;

    let progress = userMissions[mission.id]?.progress || 0;
    let shouldUpdate = false;

    switch (mission.targetType) {
      case 'play_count':
        if (mission.id === 'weekly-all-games') {
          progress = uniqueGames;
        } else {
          progress = mission.gameType ? history.games[gameType] || 0 : totalPlays;
        }
        shouldUpdate = true;
        break;

      case 'score':
        if (score > progress) {
          progress = score;
          shouldUpdate = true;
        }
        break;

      case 'win':
        if (won) {
          progress += 1;
          shouldUpdate = true;
        }
        break;

      case 'total_score':
        progress += score;
        shouldUpdate = true;
        break;
    }

    if (shouldUpdate) {
      const completed = progress >= mission.targetValue;
      userMissions[mission.id] = {
        missionId: mission.id,
        progress,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
      };
      updatedMissions.push(mission.id);

      if (completed && !userMissions[mission.id]?.claimedAt) {
        completedMissions.push(mission);
      }
    }
  }

  saveUserMissions(userMissions);

  return { updatedMissions, completedMissions };
}

// 미션 보상 수령
export function claimMissionReward(missionId: string): {
  success: boolean;
  points?: number;
  error?: string;
} {
  const mission = getMissionById(missionId);
  if (!mission) {
    return { success: false, error: '미션을 찾을 수 없습니다' };
  }

  const userMissions = getUserMissions();
  const userMission = userMissions[missionId];

  if (!userMission?.completed) {
    return { success: false, error: '미션이 완료되지 않았습니다' };
  }

  if (userMission.claimedAt) {
    return { success: false, error: '이미 보상을 수령했습니다' };
  }

  // 포인트 지급
  const newTotal = addPoints(mission.rewardPoints);

  // 수령 표시
  userMissions[missionId] = {
    ...userMission,
    claimedAt: new Date().toISOString(),
  };
  saveUserMissions(userMissions);

  return { success: true, points: newTotal };
}

// 미션 상태와 함께 가져오기
export function getMissionsWithStatus(): {
  daily: Array<Mission & { userProgress: UserMission | null }>;
  weekly: Array<Mission & { userProgress: UserMission | null }>;
} {
  checkAndResetMissions();

  const userMissions = getUserMissions();

  const daily = getTodayMissions().map((mission) => ({
    ...mission,
    userProgress: userMissions[mission.id] || null,
  }));

  const weekly = getWeeklyMissions().map((mission) => ({
    ...mission,
    userProgress: userMissions[mission.id] || null,
  }));

  return { daily, weekly };
}

// 미완료 미션 수 가져오기
export function getUnclaimedMissionCount(): number {
  const { daily, weekly } = getMissionsWithStatus();
  const all = [...daily, ...weekly];

  return all.filter(
    (m) => m.userProgress?.completed && !m.userProgress?.claimedAt
  ).length;
}
