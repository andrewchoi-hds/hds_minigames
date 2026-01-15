'use client';

import { useState } from 'react';
import SudokuGame from '@/components/games/sudoku/SudokuGame';
import { GameLobby } from '@/components/game-lobby';
import { GamePlayLayout } from '@/components/layout';

export default function SudokuPage() {
  const [showLobby, setShowLobby] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (showLobby) {
    return (
      <>
        <GameLobby
          gameId="sudoku"
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
                <span>🔢</span>
                <span>게임 방법</span>
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <span>1-9 숫자를 빈 칸에 채우세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">📏</span>
                  <span>가로, 세로, 3x3 박스에 1-9가 한 번씩만!</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <span>힌트와 메모 기능을 활용하세요</span>
                </li>
              </ul>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors"
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
    <GamePlayLayout gameId="sudoku" title="스도쿠" icon="🔢" onBack={() => setShowLobby(true)}>
      <SudokuGame />
    </GamePlayLayout>
  );
}
