'use client';

import { useState } from 'react';
import LuckyDiceGame from '@/components/games/lucky-dice/LuckyDiceGame';
import { GameLobby } from '@/components/game-lobby';
import { GamePlayLayout } from '@/components/layout';

export default function LuckyDicePage() {
  const [showLobby, setShowLobby] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (showLobby) {
    return (
      <>
        <GameLobby
          gameId="lucky-dice"
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
                <span>🎲</span>
                <span>게임 방법</span>
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <span>주사위 3개를 굴려서 점수를 얻으세요</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">✨</span>
                  <span>특별한 조합이 나오면 보너스 배수!</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🔟</span>
                  <span>총 10번의 기회가 주어집니다</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🍀</span>
                  <span>운을 시험해보세요!</span>
                </li>
              </ul>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-colors"
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
    <GamePlayLayout gameId="lucky-dice" title="럭키 다이스" icon="🎲" onBack={() => setShowLobby(true)}>
      <LuckyDiceGame />
    </GamePlayLayout>
  );
}
