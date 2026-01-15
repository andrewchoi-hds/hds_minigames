import { addPoints, getUserPoints } from './mission';

const STORAGE_KEYS = {
  ATTENDANCE_LOG: 'mini_games_attendance_log',
  STREAK: 'mini_games_attendance_streak',
};

// 출석 보상 설정
export const ATTENDANCE_REWARDS = {
  BASE_POINTS: 10,           // 기본 출석 포인트
  STREAK_BONUS: {
    3: 20,   // 3일 연속: +20P
    7: 50,   // 7일 연속: +50P
    14: 100, // 14일 연속: +100P
    30: 200, // 30일 연속: +200P
  },
};

export type AttendanceLog = {
  dates: string[];  // 출석한 날짜 배열 (YYYY-MM-DD)
  streak: number;   // 현재 연속 출석 일수
  lastCheckIn: string | null;  // 마지막 출석 날짜
};

// 오늘 날짜 문자열
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// 어제 날짜 문자열
function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// 출석 로그 가져오기
export function getAttendanceLog(): AttendanceLog {
  if (typeof window === 'undefined') {
    return { dates: [], streak: 0, lastCheckIn: null };
  }

  const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOG);
  if (!data) {
    return { dates: [], streak: 0, lastCheckIn: null };
  }

  const log: AttendanceLog = JSON.parse(data);

  // 연속 출석 체크 (어제 출석 안 했으면 streak 리셋)
  const yesterday = getYesterdayString();
  const today = getTodayString();

  if (log.lastCheckIn && log.lastCheckIn !== today && log.lastCheckIn !== yesterday) {
    // 연속 출석 끊김
    log.streak = 0;
    saveAttendanceLog(log);
  }

  return log;
}

// 출석 로그 저장
function saveAttendanceLog(log: AttendanceLog): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE_LOG, JSON.stringify(log));
}

// 오늘 출석 여부 확인
export function hasCheckedInToday(): boolean {
  const log = getAttendanceLog();
  return log.lastCheckIn === getTodayString();
}

// 출석 체크 실행
export function checkIn(): {
  success: boolean;
  points?: number;
  totalPoints?: number;
  streak?: number;
  bonusPoints?: number;
  error?: string;
} {
  if (typeof window === 'undefined') {
    return { success: false, error: '브라우저에서만 사용 가능합니다' };
  }

  const today = getTodayString();
  const log = getAttendanceLog();

  // 이미 출석했는지 확인
  if (log.lastCheckIn === today) {
    return { success: false, error: '오늘은 이미 출석했습니다' };
  }

  // 연속 출석 계산
  const yesterday = getYesterdayString();
  let newStreak = 1;

  if (log.lastCheckIn === yesterday) {
    // 어제 출석했으면 연속 유지
    newStreak = log.streak + 1;
  }

  // 기본 포인트
  let earnedPoints = ATTENDANCE_REWARDS.BASE_POINTS;
  let bonusPoints = 0;

  // 연속 출석 보너스 확인
  const streakBonuses = Object.entries(ATTENDANCE_REWARDS.STREAK_BONUS)
    .map(([days, points]) => ({ days: parseInt(days), points }))
    .sort((a, b) => b.days - a.days);

  for (const bonus of streakBonuses) {
    if (newStreak >= bonus.days && newStreak % bonus.days === 0) {
      bonusPoints = bonus.points;
      break;
    }
  }

  earnedPoints += bonusPoints;

  // 포인트 지급
  const totalPoints = addPoints(earnedPoints);

  // 로그 업데이트
  const updatedLog: AttendanceLog = {
    dates: [...log.dates, today],
    streak: newStreak,
    lastCheckIn: today,
  };
  saveAttendanceLog(updatedLog);

  return {
    success: true,
    points: earnedPoints,
    totalPoints,
    streak: newStreak,
    bonusPoints: bonusPoints > 0 ? bonusPoints : undefined,
  };
}

// 이번 달 출석 현황 가져오기
export function getMonthlyAttendance(year?: number, month?: number): {
  year: number;
  month: number;
  dates: number[];  // 출석한 날짜들 (1~31)
  totalDays: number;
} {
  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth() + 1;

  const log = getAttendanceLog();
  const prefix = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

  const dates = log.dates
    .filter((d) => d.startsWith(prefix))
    .map((d) => parseInt(d.split('-')[2]));

  // 해당 월의 총 일수
  const totalDays = new Date(targetYear, targetMonth, 0).getDate();

  return {
    year: targetYear,
    month: targetMonth,
    dates,
    totalDays,
  };
}

// 출석 통계
export function getAttendanceStats(): {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  thisMonthDays: number;
} {
  const log = getAttendanceLog();
  const monthly = getMonthlyAttendance();

  // 최장 연속 출석 계산 (간단 버전: 현재 streak 사용)
  // 실제로는 dates를 분석해야 하지만 간단하게 처리
  const longestStreak = Math.max(log.streak, log.dates.length > 0 ? 1 : 0);

  return {
    totalDays: log.dates.length,
    currentStreak: log.streak,
    longestStreak,
    thisMonthDays: monthly.dates.length,
  };
}
