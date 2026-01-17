'use client';

import { useState } from 'react';
import TicTacToeGame from '@/components/games/tic-tac-toe/TicTacToeGame';
import { GameLobby } from '@/components/game-lobby';
import { GamePlayLayout } from '@/components/layout';

export default function TicTacToePage() {
  const [showLobby, setShowLobby] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (showLobby) {
    return (
      <>
        <GameLobby
          gameId="tic-tac-toe"
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
                <span>⭕</span>
                <span>게임 방법</span>
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-xl">👆</span>
                  <span>빈 칸을 클릭해서 X를 놓으세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <span>가로, 세로, 대각선으로 3개를 연결하면 승리!</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🤖</span>
                  <span>AI보다 먼저 3개를 만들어보세요</span>
                </li>
              </ul>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
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
    <GamePlayLayout gameId="tic-tac-toe" title="틱택토" icon="⭕" onBack={() => setShowLobby(true)}>
      <TicTacToeGame />
    </GamePlayLayout>
  );
}
