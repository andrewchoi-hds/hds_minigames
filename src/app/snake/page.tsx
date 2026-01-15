'use client';

import { useState } from 'react';
import SnakeGame from '@/components/games/snake/SnakeGame';
import { GameLobby } from '@/components/game-lobby';

export default function SnakePage() {
  const [showLobby, setShowLobby] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (showLobby) {
    return (
      <>
        <GameLobby
          gameId="snake"
          onStart={() => setShowLobby(false)}
          showHowToPlay={true}
          onHowToPlay={() => setShowHowToPlay(true)}
        />

        {/* 게임 방법 모달 */}
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
                <span>🐍</span>
                <span>게임 방법</span>
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-xl">⬆️</span>
                  <span>화살표 키 또는 WASD로 뱀을 조종하세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🍎</span>
                  <span>사과를 먹으면 뱀이 길어집니다</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">💥</span>
                  <span>벽이나 자기 몸에 부딪히면 게임 오버!</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">⚡</span>
                  <span>점점 빨라지는 속도에 도전하세요!</span>
                </li>
              </ul>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors"
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
      <div className="max-w-lg mx-auto">
        {/* 상단 바 */}
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
          <h1 className="text-lg font-bold">🐍 뱀 게임</h1>
          <div className="w-12" />
        </div>

        <SnakeGame />
      </div>
    </main>
  );
}
