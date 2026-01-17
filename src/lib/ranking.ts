import { supabase, GameType, RankingEntry, Score } from './supabase';
import { getLocalUser } from './auth';

export type Period = 'daily' | 'weekly' | 'all';

// 점수 제출
export async function submitScore(params: {
  gameType: GameType;
  difficulty?: string;
  score: number;
  timeSeconds?: number;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> {
  const user = getLocalUser();

  if (!user) {
    return { success: false, error: '로그인이 필요합니다' };
  }

  const insertData = {
    user_id: user.id,
    game_type: params.gameType,
    difficulty: params.difficulty || null,
    score: params.score,
    time_seconds: params.timeSeconds || null,
    metadata: params.metadata || {},
  };

  const { error } = await supabase.from('scores').insert(insertData).select();

  if (error) {
    return { success: false, error: `점수 제출 중 오류: ${error.message}` };
  }

  return { success: true };
}

// 랭킹 조회
export async function getRanking(params: {
  gameType: GameType;
  difficulty?: string;
  period?: Period;
  limit?: number;
}): Promise<{ data: RankingEntry[]; error?: string }> {
  const { data, error } = await supabase.rpc('get_ranking', {
    p_game_type: params.gameType,
    p_difficulty: params.difficulty || null,
    p_period: params.period || 'all',
    p_limit: params.limit || 100,
  });

  if (error) {
    return { data: [], error: '랭킹 조회 중 오류가 발생했습니다' };
  }

  return { data: data || [] };
}

// 내 순위 조회
export async function getMyRank(params: {
  gameType: GameType;
  difficulty?: string;
  period?: Period;
}): Promise<number> {
  const user = getLocalUser();
  if (!user) return 0;

  const { data, error } = await supabase.rpc('get_user_rank', {
    p_user_id: user.id,
    p_game_type: params.gameType,
    p_difficulty: params.difficulty || null,
    p_period: params.period || 'all',
  });

  if (error) {
    return 0;
  }

  return data || 0;
}

// 내 기록 조회
export async function getMyScores(params: {
  gameType?: GameType;
  limit?: number;
}): Promise<{ data: Score[]; error?: string }> {
  const user = getLocalUser();
  if (!user) {
    return { data: [], error: '로그인이 필요합니다' };
  }

  let query = supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(params.limit || 50);

  if (params.gameType) {
    query = query.eq('game_type', params.gameType);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: '기록 조회 중 오류가 발생했습니다' };
  }

  return { data: data || [] };
}

// 내 최고 점수 조회
export async function getMyBestScore(params: {
  gameType: GameType;
  difficulty?: string;
}): Promise<Score | null> {
  const user = getLocalUser();
  if (!user) return null;

  let query = supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .eq('game_type', params.gameType)
    .order('score', { ascending: false })
    .limit(1);

  if (params.difficulty) {
    query = query.eq('difficulty', params.difficulty);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
}

// 점수 산정 유틸리티
export const ScoreCalculator = {
  // 스도쿠: (난이도 가중치 × 10000) - (소요시간 × 10) - (힌트 사용 × 500)
  sudoku: (difficulty: string, timeSeconds: number, hintsUsed: number): number => {
    const weights: Record<string, number> = {
      normal: 1.0,
      hard: 1.5,
      expert: 2.0,
      master: 3.0,
      extreme: 5.0,
    };
    const weight = weights[difficulty] || 1.0;
    return Math.max(0, Math.round(weight * 10000 - timeSeconds * 10 - hintsUsed * 500));
  },

  // 2048: 게임 점수 그대로 사용 + 최고 타일 보너스
  puzzle2048: (score: number, maxTile: number): number => {
    const tileBonus = maxTile >= 2048 ? 5000 : maxTile >= 1024 ? 2000 : maxTile >= 512 ? 500 : 0;
    return score + tileBonus;
  },

  // 메모리 게임: (난이도 기본점수) - (추가 시도 × 50) - (소요시간 × 5)
  memory: (difficulty: string, attempts: number, timeSeconds: number): number => {
    const config: Record<string, { baseScore: number; minAttempts: number }> = {
      easy: { baseScore: 6000, minAttempts: 6 },
      normal: { baseScore: 8000, minAttempts: 8 },
      hard: { baseScore: 12000, minAttempts: 12 },
    };
    const { baseScore, minAttempts } = config[difficulty] || { baseScore: 6000, minAttempts: 6 };
    const extraAttempts = Math.max(0, attempts - minAttempts);
    return Math.max(0, Math.round(baseScore - extraAttempts * 50 - timeSeconds * 5));
  },

  // 지뢰찾기: (난이도 기본점수) - (소요시간 × 10)
  minesweeper: (difficulty: string, timeSeconds: number): number => {
    const baseScores: Record<string, number> = {
      easy: 5000,
      normal: 10000,
      hard: 20000,
    };
    const baseScore = baseScores[difficulty] || 5000;
    return Math.max(0, Math.round(baseScore - timeSeconds * 10));
  },

  // 워들: (6 - 시도횟수) × 1000 + 시간 보너스
  wordle: (attempts: number, timeSeconds: number): number => {
    const attemptScore = Math.max(0, (6 - attempts) * 1000);
    const timeBonus = Math.max(0, 300 - timeSeconds);
    return attemptScore + timeBonus;
  },

  // 슬라이딩 퍼즐: (난이도 기본점수) - (이동 횟수 × 10) - (소요시간 × 5)
  slidingPuzzle: (difficulty: string, moves: number, timeSeconds: number): number => {
    const baseScores: Record<string, number> = {
      '3x3': 5000,
      '4x4': 10000,
      '5x5': 20000,
    };
    const baseScore = baseScores[difficulty] || 5000;
    return Math.max(0, Math.round(baseScore - moves * 10 - timeSeconds * 5));
  },

  // 타이핑: WPM × 100 + 정확도 보너스
  typing: (wpm: number, accuracy: number, combo: number): number => {
    return Math.round(wpm * 100 + accuracy * 10 + combo * 5);
  },

  // 반응속도: 10000 - 평균 반응시간(ms) × 10
  reaction: (avgReactionTime: number): number => {
    return Math.max(0, Math.round(10000 - avgReactionTime * 10));
  },

  // 숫자 야구: (20 - 시도횟수) × 500 + 시간 보너스
  baseball: (attempts: number, timeSeconds: number, digitCount: number): number => {
    const digitBonus = digitCount === 4 ? 2000 : 0;
    const attemptScore = Math.max(0, (20 - attempts) * 500);
    const timeBonus = Math.max(0, 300 - timeSeconds);
    return attemptScore + timeBonus + digitBonus;
  },

  // 플래피 버드: 파이프 통과 × 100
  flappy: (pipesCleared: number): number => {
    return pipesCleared * 100;
  },

  // 뱀 게임: 사과 × 100 + (길이 - 3) × 50
  snake: (applesEaten: number, snakeLength: number): number => {
    return applesEaten * 100 + (snakeLength - 3) * 50;
  },

  // 벽돌깨기: 점수 + 콤보 보너스
  breakout: (score: number, bricksCleared: number, maxCombo: number): number => {
    const comboBonus = maxCombo * 50;
    return score + comboBonus;
  },

  // 색상 맞추기: 점수 + 라운드 보너스 + 연속 정답 보너스
  colorMatch: (score: number, rounds: number, maxStreak: number): number => {
    const roundBonus = rounds * 10;
    const streakBonus = maxStreak * 50;
    return score + roundBonus + streakBonus;
  },

  // 틱택토: 승리 × 난이도 배수
  ticTacToe: (won: boolean, difficulty: string, moveCount: number): number => {
    if (!won) return 0;
    const diffMultiplier: Record<string, number> = { easy: 1, normal: 2, hard: 5 };
    const mult = diffMultiplier[difficulty] || 1;
    const speedBonus = Math.max(0, (9 - moveCount) * 20);
    return (500 + speedBonus) * mult;
  },

  // 사이먼: 레벨² × 10 (레벨이 높을수록 급격히 증가)
  simon: (level: number): number => {
    return level * level * 10;
  },

  // 하이로우: 점수 + 최대연속 보너스
  highLow: (score: number, maxStreak: number): number => {
    const streakBonus = maxStreak * maxStreak * 5; // 연속이 높을수록 보너스 증가
    return score + streakBonus;
  },

  // 럭키다이스: 점수 그대로 (이미 게임 내에서 ×100 적용됨)
  luckyDice: (score: number, bonusCount: number): number => {
    return score + bonusCount * 100;
  },
};
