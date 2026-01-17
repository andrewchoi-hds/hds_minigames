'use client';

import { useState } from 'react';
import HighLowGame from '@/components/games/high-low/HighLowGame';
import { GameLobby } from '@/components/game-lobby';
import { GamePlayLayout } from '@/components/layout';

export default function HighLowPage() {
  const [showLobby, setShowLobby] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (showLobby) {
    return (
      <>
        <GameLobby
          gameId="high-low"
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
                <span>🃏</span>
                <span>게임 방법</span>
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-xl">🎴</span>
                  <span>현재 카드를 확인하세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🤔</span>
                  <span>다음 카드가 더 높은지, 낮은지 예측하세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <span>SAME을 맞추면 5배 점수!</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">❤️</span>
                  <span>3번 틀리면 게임 오버</span>
                </li>
              </ul>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-colors"
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
    <GamePlayLayout gameId="high-low" title="하이로우" icon="🃏" onBack={() => setShowLobby(true)}>
      <HighLowGame />
    </GamePlayLayout>
  );
}
