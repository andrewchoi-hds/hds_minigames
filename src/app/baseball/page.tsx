'use client';

import { useState } from 'react';
import BaseballGame from '@/components/games/baseball/BaseballGame';
import { GameLobby } from '@/components/game-lobby';
import { GamePlayLayout } from '@/components/layout';

export default function BaseballPage() {
  const [showLobby, setShowLobby] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (showLobby) {
    return (
      <>
        <GameLobby
          gameId="baseball"
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
                <span>⚾</span>
                <span>게임 방법</span>
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <span>숫자를 추리해서 정답을 맞추세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">⚾</span>
                  <span>스트라이크: 숫자와 위치 모두 맞음</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">⚪</span>
                  <span>볼: 숫자는 있지만 위치가 다름</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🏆</span>
                  <span>적은 턴 안에 맞추면 고득점!</span>
                </li>
              </ul>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
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
    <GamePlayLayout gameId="baseball" title="숫자 야구" icon="⚾" onBack={() => setShowLobby(true)}>
      <BaseballGame />
    </GamePlayLayout>
  );
}
