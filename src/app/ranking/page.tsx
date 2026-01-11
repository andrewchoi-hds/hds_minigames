'use client';

import { useState } from 'react';
import Link from 'next/link';
import RankingBoard from '@/components/ranking/RankingBoard';
import UserAuth from '@/components/ranking/UserAuth';
import { GameType, GAME_NAMES } from '@/lib/supabase';

const GAMES: { type: GameType; emoji: string; difficulties?: string[] }[] = [
  { type: 'sudoku', emoji: '🔢', difficulties: ['normal', 'hard', 'expert', 'master', 'extreme'] },
  { type: 'puzzle2048', emoji: '🎯' },
  { type: 'memory', emoji: '🃏', difficulties: ['easy', 'normal', 'hard'] },
  { type: 'minesweeper', emoji: '💣', difficulties: ['easy', 'normal', 'hard'] },
  { type: 'wordle', emoji: '📝' },
  { type: 'sliding-puzzle', emoji: '🧩', difficulties: ['3x3', '4x4', '5x5'] },
  { type: 'typing', emoji: '⌨️', difficulties: ['easy', 'normal', 'hard'] },
  { type: 'reaction', emoji: '⚡' },
  { type: 'baseball', emoji: '⚾', difficulties: ['3digit', '4digit'] },
  { type: 'flappy', emoji: '🐦' },
  { type: 'snake', emoji: '🐍' },
  { type: 'breakout', emoji: '🧱' },
  { type: 'color-match', emoji: '🎨' },
];

export default function RankingPage() {
  const [selectedGame, setSelectedGame] = useState<GameType>('sudoku');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>(undefined);

  const currentGame = GAMES.find((g) => g.type === selectedGame);

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            ← 홈
          </Link>
          <h1 className="text-2xl font-bold">🏆 랭킹</h1>
          <div className="w-12" />
        </div>

        {/* 로그인 */}
        <div className="mb-6 flex justify-end">
          <UserAuth />
        </div>

        {/* 게임 선택 */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">게임 선택</h2>
          <div className="flex flex-wrap gap-2">
            {GAMES.map((game) => (
              <button
                key={game.type}
                onClick={() => {
                  setSelectedGame(game.type);
                  setSelectedDifficulty(undefined);
                }}
                className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  selectedGame === game.type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{game.emoji}</span>
                <span className="hidden sm:inline">{GAME_NAMES[game.type]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 난이도 선택 */}
        {currentGame?.difficulties && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">난이도</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDifficulty(undefined)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !selectedDifficulty
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                전체
              </button>
              {currentGame.difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedDifficulty === diff
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 랭킹 보드 */}
        <RankingBoard
          key={`${selectedGame}-${selectedDifficulty}`}
          gameType={selectedGame}
          difficulty={selectedDifficulty}
          showPeriodFilter={true}
          limit={100}
        />
      </div>
    </main>
  );
}
