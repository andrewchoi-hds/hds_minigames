'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { GAMES } from '@/lib/data/games';
import { GameType } from '@/lib/supabase';
import { GameIcon } from '@/components/icons';
import MiniRanking from './MiniRanking';

// gameId -> GameType 변환
function toGameType(gameId: string): GameType {
  if (gameId === 'puzzle-2048') return 'puzzle2048';
  return gameId as GameType;
}

type GameLobbyProps = {
  gameId: string;
  onStart: () => void;
  children?: ReactNode;
  difficulty?: string;
  showHowToPlay?: boolean;
  onHowToPlay?: () => void;
};

export default function GameLobby({
  gameId,
  onStart,
  children,
  difficulty,
  showHowToPlay = true,
  onHowToPlay,
}: GameLobbyProps) {
  const game = GAMES.find((g) => g.id === gameId);

  if (!game) {
    return <div>게임을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* 상단 네비게이션 */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link
          href="/"
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          {game.name}
        </h1>
        <div className="w-5" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-4">
        {/* 히어로 카드 */}
        <div
          className={`
            relative overflow-hidden rounded-2xl
            bg-gradient-to-br ${game.gradient}
            p-6 shadow-lg
          `}
        >
          {/* 배경 효과 */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 50%),
                  radial-gradient(circle at 20% 80%, rgba(255,255,255,0.2) 0%, transparent 40%)
                `,
              }}
            />
          </div>

          <div className="relative z-10 flex items-center gap-4">
            {/* 아이콘 */}
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <GameIcon gameId={gameId} size={40} className="text-white drop-shadow-lg" />
            </div>

            {/* 텍스트 */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{game.name}</h2>
                {game.isNew && (
                  <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                    NEW
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm">{game.description}</p>
            </div>
          </div>
        </div>

        {/* 난이도 선택 등 추가 옵션 */}
        {children && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            {children}
          </div>
        )}

        {/* 미션 & 게임방법 */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mission</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {getMissionText(gameId, difficulty)}
              </p>
            </div>
            {showHowToPlay && (
              <button
                onClick={onHowToPlay}
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <span>게임방법</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 미니 랭킹 */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <span className="font-bold text-gray-900 dark:text-white">TOP 3</span>
            </div>
            <Link
              href={`/ranking?game=${gameId}`}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <span>더보기</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <MiniRanking gameType={toGameType(gameId)} difficulty={difficulty} />
        </div>

        {/* 스페이서 */}
        <div className="flex-1" />

        {/* GAME START 버튼 */}
        <button
          onClick={onStart}
          className={`
            mt-4 w-full py-4 rounded-2xl font-bold text-lg
            bg-gradient-to-r ${game.gradient}
            text-white shadow-lg
            hover:shadow-xl hover:scale-[1.02]
            active:scale-[0.98]
            transition-all duration-200
            flex items-center justify-center gap-3
          `}
        >
          <span>GAME START</span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function getMissionText(gameId: string, difficulty?: string): string {
  const missions: Record<string, string> = {
    'sudoku': '퍼즐을 완성하세요!',
    'puzzle-2048': '2048 타일 만들기',
    'memory': '모든 카드 짝 맞추기',
    'minesweeper': '지뢰 피해 클리어',
    'wordle': '6번 안에 정답 맞추기',
    'sliding-puzzle': '퍼즐 완성하기',
    'typing': '100점 이상 달성',
    'reaction': '평균 300ms 이하',
    'baseball': '10턴 안에 정답 맞추기',
    'flappy': '10개 파이프 통과',
    'snake': '사과 20개 먹기',
    'breakout': '모든 벽돌 깨기',
    'color-match': '200점 달성하기',
  };
  return missions[gameId] || '최고 점수에 도전!';
}
