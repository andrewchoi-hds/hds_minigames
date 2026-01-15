'use client';

import { useState } from 'react';
import Game2048 from '@/components/games/puzzle-2048/Game2048';
import { GameLobby } from '@/components/game-lobby';

export default function Puzzle2048Page() {
  const [showLobby, setShowLobby] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (showLobby) {
    return (
      <>
        <GameLobby
          gameId="puzzle-2048"
          onStart={() => setShowLobby(false)}
          showHowToPlay={true}
          onHowToPlay={() => setShowHowToPlay(true)}
        />

        {showHowToPlay && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHowToPlay(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎯</span>
                <span>게임 방법</span>
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-xl">⬆️</span>
                  <span>화살표 키로 타일을 움직이세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🔢</span>
                  <span>같은 숫자를 합쳐 더 큰 숫자를 만드세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🏆</span>
                  <span>2048 타일을 만들면 승리!</span>
                </li>
              </ul>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowLobby(true)}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>로비</span>
          </button>
          <h1 className="text-lg font-bold">🎯 2048</h1>
          <div className="w-12" />
        </div>

        <Game2048 />
      </div>
    </main>
  );
}
