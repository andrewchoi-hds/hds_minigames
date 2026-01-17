'use client';

import { useState } from 'react';
import SimonGame from '@/components/games/simon/SimonGame';
import { GameLobby } from '@/components/game-lobby';
import { GamePlayLayout } from '@/components/layout';

export default function SimonPage() {
  const [showLobby, setShowLobby] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (showLobby) {
    return (
      <>
        <GameLobby
          gameId="simon"
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
                <span>🎵</span>
                <span>게임 방법</span>
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-xl">👀</span>
                  <span>빛나는 색깔 순서를 기억하세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">👆</span>
                  <span>같은 순서대로 버튼을 누르세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">📈</span>
                  <span>라운드마다 패턴이 길어집니다</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🔊</span>
                  <span>소리도 함께 기억하면 더 쉬워요!</span>
                </li>
              </ul>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors"
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
    <GamePlayLayout gameId="simon" title="사이먼 게임" icon="🎵" onBack={() => setShowLobby(true)}>
      <SimonGame />
    </GamePlayLayout>
  );
}
