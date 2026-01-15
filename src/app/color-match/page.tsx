'use client';

import { useState } from 'react';
import ColorMatchGame from '@/components/games/color-match/ColorMatchGame';
import { GameLobby } from '@/components/game-lobby';
import { GamePlayLayout } from '@/components/layout';

export default function ColorMatchPage() {
  const [showLobby, setShowLobby] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (showLobby) {
    return (
      <>
        <GameLobby
          gameId="color-match"
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
                <span>🎨</span>
                <span>게임 방법</span>
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-xl">👀</span>
                  <span>글자의 색상을 맞추세요 (글자 내용이 아닌!)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🧠</span>
                  <span>스트룹 효과로 헷갈릴 수 있어요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">⏱️</span>
                  <span>제한 시간 내에 최대한 많이 맞추세요</span>
                </li>
              </ul>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-colors"
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
    <GamePlayLayout gameId="color-match" title="색상 맞추기" icon="🎨" onBack={() => setShowLobby(true)}>
      <ColorMatchGame />
    </GamePlayLayout>
  );
}
