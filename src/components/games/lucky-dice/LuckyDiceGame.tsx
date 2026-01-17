'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  initGame,
  doRoll,
  getBonusInfo,
  BonusType,
} from '@/lib/games/lucky-dice';
import { recordGamePlay } from '@/lib/mission';
import { recordGameStats } from '@/lib/stats';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

// 주사위 컴포넌트
function Dice({ value, isRolling }: { value: number; isRolling: boolean }) {
  const dots: Record<number, number[][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };

  return (
    <div
      className={`w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl shadow-lg p-2 sm:p-3 transition-transform
        ${isRolling ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''}
      `}
    >
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5">
        {[0, 1, 2].map(row =>
          [0, 1, 2].map(col => {
            const hasDot = dots[value]?.some(([r, c]) => r === row && c === col);
            return (
              <div key={`${row}-${col}`} className="flex items-center justify-center">
                {hasDot && (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 rounded-full" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function LuckyDiceGame() {
  const [gameState, setGameState] = useState<GameState>(initGame());
  const [isRolling, setIsRolling] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hasRecordedGame, setHasRecordedGame] = useState(false);
  const [displayDice, setDisplayDice] = useState([1, 1, 1]);

  const isGameOver = gameState.rollsLeft === 0;

  // 게임 오버 시 기록
  useEffect(() => {
    if (isGameOver && !hasRecordedGame) {
      recordGamePlay({ gameType: 'lucky-dice', score: gameState.totalScore, won: gameState.totalScore >= 100 });
      recordGameStats({ gameType: 'lucky-dice', score: gameState.totalScore, won: gameState.totalScore >= 100 });
      setHasRecordedGame(true);
    }
  }, [isGameOver, gameState.totalScore, hasRecordedGame]);

  // 주사위 굴리기
  const handleRoll = useCallback(() => {
    if (isRolling || isGameOver) return;

    setIsRolling(true);
    setShowBonus(false);

    // 굴리는 애니메이션 (랜덤 숫자 표시)
    const animationInterval = setInterval(() => {
      setDisplayDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(animationInterval);
      setIsRolling(false);

      setGameState(prev => {
        const newState = doRoll(prev);
        setDisplayDice(newState.currentDice);

        if (newState.lastBonus) {
          setShowBonus(true);
          setTimeout(() => setShowBonus(false), 2000);
        }

        return newState;
      });
    }, 800);
  }, [isRolling, isGameOver]);

  // 게임 다시 시작
  const restartGame = () => {
    setGameState(initGame());
    setDisplayDice([1, 1, 1]);
    setShowBonus(false);
    setHasRecordedGame(false);
  };

  // 마지막 롤 결과
  const lastRoll = gameState.rolls[gameState.rolls.length - 1];

  return (
    <div className="w-full">
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">남은 기회: </span>
            <span className="font-bold text-blue-600">{gameState.rollsLeft}회</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">점수: </span>
            <span className="font-bold text-purple-600">{gameState.totalScore}</span>
          </div>
          {gameState.highScore > 0 && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">최고: </span>
              <span className="font-bold text-amber-500">{gameState.highScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* 주사위 영역 */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-6 shadow-lg mb-4">
        <div className="flex justify-center items-center gap-3 sm:gap-4">
          {displayDice.map((value, index) => (
            <Dice key={index} value={value} isRolling={isRolling} />
          ))}
        </div>

        {/* 결과 표시 */}
        {lastRoll && !isRolling && (
          <div className="text-center mt-4">
            <div className="text-white text-lg">
              합계: <span className="font-bold">{lastRoll.total}</span>
              {lastRoll.bonus && (
                <span className="ml-2 text-yellow-300">
                  × {lastRoll.bonusMultiplier}
                </span>
              )}
              <span className="ml-2">= <span className="font-bold text-yellow-300">+{lastRoll.score}점</span></span>
            </div>
          </div>
        )}

        {/* 보너스 표시 */}
        {showBonus && gameState.lastBonus && (
          <div className="mt-4 text-center animate-bounce">
            <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-lg shadow-lg">
              {getBonusInfo(gameState.lastBonus as BonusType).emoji}{' '}
              {getBonusInfo(gameState.lastBonus as BonusType).name}
            </div>
          </div>
        )}
      </div>

      {/* 굴리기 버튼 */}
      {!isGameOver && (
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-xl rounded-xl transition-all shadow-lg disabled:cursor-not-allowed"
        >
          {isRolling ? '🎲 굴리는 중...' : '🎲 주사위 굴리기!'}
        </button>
      )}

      {/* 보너스 설명 */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="font-bold mb-2 text-sm text-gray-600 dark:text-gray-400">보너스 조합</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span>🎰</span> <span className="text-gray-600 dark:text-gray-400">666 = ×10</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🖐️</span> <span className="text-gray-600 dark:text-gray-400">555 = ×8</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🐍</span> <span className="text-gray-600 dark:text-gray-400">111 = ×5</span>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <span>💀</span> <span>444 = 0점!</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🎯</span> <span className="text-gray-600 dark:text-gray-400">트리플 = ×3</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📈</span> <span className="text-gray-600 dark:text-gray-400">연속 = ×2.5</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔥</span> <span className="text-gray-600 dark:text-gray-400">빅(16+) = ×2</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🐜</span> <span className="text-gray-600 dark:text-gray-400">스몰(5-) = ×2</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🍀</span> <span className="text-gray-600 dark:text-gray-400">합7 = ×1.5</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔮</span> <span className="text-gray-600 dark:text-gray-400">올홀수 = ×1.5</span>
          </div>
          <div className="flex items-center gap-1">
            <span>✨</span> <span className="text-gray-600 dark:text-gray-400">올짝수 = ×1.5</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👯</span> <span className="text-gray-600 dark:text-gray-400">페어 = ×1.2</span>
          </div>
        </div>
      </div>

      {/* 다시 시작 버튼 */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={restartGame}
          className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          다시 시작
        </button>
      </div>

      {/* 게임 오버 모달 */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-xl max-w-sm w-full">
            <div className="text-5xl mb-4">
              {gameState.totalScore >= 200 ? '🏆' : gameState.totalScore >= 100 ? '🎉' : '🎲'}
            </div>
            <h3 className="text-2xl font-bold mb-2">게임 완료!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {gameState.totalScore >= 200
                ? '대박! 행운의 주인공!'
                : gameState.totalScore >= 100
                ? '좋은 운이에요!'
                : '다음엔 더 좋은 운이!'}
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">총 굴림</span>
                <span className="font-bold">{gameState.rolls.length}회</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">보너스 횟수</span>
                <span className="font-bold text-yellow-600">
                  {gameState.rolls.filter(r => r.bonus).length}회
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">최종 점수</span>
                <span className="font-bold text-purple-600">{gameState.totalScore}점</span>
              </div>
              {gameState.totalScore >= gameState.highScore && gameState.totalScore > 0 && (
                <div className="text-amber-500 font-bold text-sm mt-2">
                  🎉 새로운 최고 기록!
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={restartGame}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                다시 하기
              </button>
              <button
                onClick={() => setShowScoreModal(true)}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-500 hover:to-orange-600 transition-colors"
              >
                랭킹 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 점수 제출 모달 */}
      <ScoreSubmitModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        gameType="lucky-dice"
        score={ScoreCalculator.luckyDice(gameState.totalScore, gameState.rolls.filter(r => r.bonus).length)}
        metadata={{ totalScore: gameState.totalScore, bonusCount: gameState.rolls.filter(r => r.bonus).length }}
      />

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
