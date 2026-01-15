'use client';

import { useState } from 'react';
import TypingGame from '@/components/games/typing/TypingGame';
import { GameLobby } from '@/components/game-lobby';

export default function TypingPage() {
  const [showLobby, setShowLobby] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (showLobby) {
    return (
      <>
        <GameLobby
          gameId="typing"
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
                <span>⌨️</span>
                <span>게임 방법</span>
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-xl">📝</span>
                  <span>떨어지는 단어를 타이핑하세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">⏱️</span>
                  <span>바닥에 닿기 전에 입력 완료!</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🔥</span>
                  <span>콤보를 유지하면 점수 UP!</span>
                </li>
              </ul>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-3 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600 transition-colors"
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
          <h1 className="text-lg font-bold">⌨️ 타이핑 게임</h1>
          <div className="w-12" />
        </div>

        <TypingGame />
      </div>
    </main>
  );
}
