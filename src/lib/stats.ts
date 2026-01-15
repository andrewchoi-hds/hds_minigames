import { GameType, GAME_NAMES } from './supabase';

const STORAGE_KEY = 'mini_games_stats';

// 게임별 통계
export type GameStats = {
  playCount: number;
  totalScore: number;
  bestScore: number;
  totalTime: number;  // 초 단위
  wins: number;
  lastPlayed?: string;
};

// 전체 통계
export type UserStats = {
  games: Partial<Record<GameType, GameStats>>;
  totalPlays: number;
  totalScore: number;
  totalTime: number;
  favoriteGame?: GameType;
  joinDate: string;
  lastActive: string;
};

// 기본 통계 객체
function getDefaultStats(): UserStats {
  return {
    games: {},
    totalPlays: 0,
    totalScore: 0,
    totalTime: 0,
    joinDate: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
}

// 통계 가져오기
export function getUserStats(): UserStats {
  if (typeof window === 'undefined') return getDefaultStats();

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const defaultStats = getDefaultStats();
    saveUserStats(defaultStats);
    return defaultStats;
  }

  return JSON.parse(data);
}

// 통계 저장
function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

// 게임 플레이 기록
export function recordGameStats(params: {
  gameType: GameType;
  score: number;
  timeSeconds?: number;
  won?: boolean;
}): void {
  const { gameType, score, timeSeconds = 0, won = false } = params;
  const stats = getUserStats();

  // 게임별 통계 업데이트
  const gameStats = stats.games[gameType] || {
    playCount: 0,
    totalScore: 0,
    bestScore: 0,
    totalTime: 0,
    wins: 0,
  };

  gameStats.playCount += 1;
  gameStats.totalScore += score;
  gameStats.bestScore = Math.max(gameStats.bestScore, score);
  gameStats.totalTime += timeSeconds;
  if (won) gameStats.wins += 1;
  gameStats.lastPlayed = new Date().toISOString();

  stats.games[gameType] = gameStats;

  // 전체 통계 업데이트
  stats.totalPlays += 1;
  stats.totalScore += score;
  stats.totalTime += timeSeconds;
  stats.lastActive = new Date().toISOString();

  // 가장 많이 플레이한 게임 찾기
  let maxPlays = 0;
  let favoriteGame: GameType | undefined;
  for (const [game, gameData] of Object.entries(stats.games)) {
    if (gameData && gameData.playCount > maxPlays) {
      maxPlays = gameData.playCount;
      favoriteGame = game as GameType;
    }
  }
  stats.favoriteGame = favoriteGame;

  saveUserStats(stats);
}

// 게임별 통계 가져오기
export function getGameStats(gameType: GameType): GameStats | null {
  const stats = getUserStats();
  return stats.games[gameType] || null;
}

// 플레이한 게임 목록
export function getPlayedGames(): Array<{
  gameType: GameType;
  name: string;
  stats: GameStats;
}> {
  const stats = getUserStats();
  const games: Array<{ gameType: GameType; name: string; stats: GameStats }> = [];

  for (const [gameType, gameStats] of Object.entries(stats.games)) {
    if (gameStats && gameStats.playCount > 0) {
      games.push({
        gameType: gameType as GameType,
        name: GAME_NAMES[gameType as GameType] || gameType,
        stats: gameStats,
      });
    }
  }

  // 플레이 횟수 기준 정렬
  return games.sort((a, b) => b.stats.playCount - a.stats.playCount);
}

// 요약 통계
export function getStatsSummary(): {
  totalPlays: number;
  totalScore: number;
  totalTimeMinutes: number;
  gamesPlayed: number;
  favoriteGame?: { type: GameType; name: string };
  bestGame?: { type: GameType; name: string; score: number };
  winRate: number;
} {
  const stats = getUserStats();
  const playedGames = getPlayedGames();

  // 최고 점수 게임 찾기
  let bestGame: { type: GameType; name: string; score: number } | undefined;
  for (const game of playedGames) {
    if (!bestGame || game.stats.bestScore > bestGame.score) {
      bestGame = {
        type: game.gameType,
        name: game.name,
        score: game.stats.bestScore,
      };
    }
  }

  // 승률 계산
  const totalWins = playedGames.reduce((sum, g) => sum + g.stats.wins, 0);
  const winRate = stats.totalPlays > 0 ? Math.round((totalWins / stats.totalPlays) * 100) : 0;

  return {
    totalPlays: stats.totalPlays,
    totalScore: stats.totalScore,
    totalTimeMinutes: Math.round(stats.totalTime / 60),
    gamesPlayed: playedGames.length,
    favoriteGame: stats.favoriteGame
      ? { type: stats.favoriteGame, name: GAME_NAMES[stats.favoriteGame] }
      : undefined,
    bestGame,
    winRate,
  };
}

// 시간 포맷팅
export function formatPlayTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}
