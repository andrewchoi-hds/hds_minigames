import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 환경 변수가 없을 때는 더미 URL 사용 (빌드 시점 에러 방지)
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Supabase 연결 여부 확인
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// 타입 정의
export type User = {
  id: string;
  nickname: string;
  created_at: string;
};

export type Score = {
  id: number;
  user_id: string;
  game_type: string;
  difficulty: string | null;
  score: number;
  time_seconds: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type RankingEntry = {
  rank: number;
  user_id: string;
  nickname: string;
  score: number;
  time_seconds: number | null;
  created_at: string;
};

// 게임 타입
export type GameType =
  | 'sudoku'
  | 'puzzle2048'
  | 'memory'
  | 'minesweeper'
  | 'wordle'
  | 'sliding-puzzle'
  | 'typing'
  | 'reaction'
  | 'baseball';

// 게임별 표시 이름
export const GAME_NAMES: Record<GameType, string> = {
  sudoku: '스도쿠',
  puzzle2048: '2048',
  memory: '메모리 게임',
  minesweeper: '지뢰찾기',
  wordle: '워들',
  'sliding-puzzle': '슬라이딩 퍼즐',
  typing: '타이핑 게임',
  reaction: '반응속도 테스트',
  baseball: '숫자 야구',
};
