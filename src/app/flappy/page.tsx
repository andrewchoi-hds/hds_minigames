'use client';

import { useState } from 'react';
import FlappyGame from '@/components/games/flappy/FlappyGame';
import { GameLobby } from '@/components/game-lobby';
import { GamePlayLayout } from '@/components/layout';

export default function FlappyPage() {
  const [showLobby, setShowLobby] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (showLobby) {
    return (
      <>
        <GameLobby
          gameId="flappy"
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
                <span>🐦</span>
                <span>게임 방법</span>
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-xl">👆</span>
                  <span>화면을 탭하거나 스페이스바를 눌러 점프</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🚧</span>
                  <span>파이프 사이를 통과하세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">💥</span>
                  <span>파이프나 바닥에 닿으면 게임 오버!</span>
                </li>
              </ul>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-colors"
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
    <GamePlayLayout gameId="flappy" title="플래피 버드" icon="🐦" onBack={() => setShowLobby(true)}>
      <FlappyGame />
    </GamePlayLayout>
  );
}
