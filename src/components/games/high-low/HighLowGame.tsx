'use client';

import { useState, useEffect } from 'react';
import {
  GameState,
  initGame,
  makeGuess,
  getSuitSymbol,
  getSuitColor,
  Card,
} from '@/lib/games/high-low';
import { recordGamePlay } from '@/lib/mission';
import { recordGameStats } from '@/lib/stats';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

function CardDisplay({ card, isHidden = false, isNew = false }: { card: Card; isHidden?: boolean; isNew?: boolean }) {
  const symbol = getSuitSymbol(card.suit);
  const color = getSuitColor(card.suit);

  if (isHidden) {
    return (
      <div className="w-32 h-44 sm:w-40 sm:h-56 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg flex items-center justify-center">
        <span className="text-4xl">🂠</span>
      </div>
    );
  }

  return (
    <div
      className={`w-32 h-44 sm:w-40 sm:h-56 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center border-2 border-gray-200
        ${isNew ? 'animate-[flip_0.3s_ease-out]' : ''}
      `}
    >
      <div className={`text-3xl sm:text-4xl font-bold ${color}`}>
        {card.rank}
      </div>
      <div className={`text-4xl sm:text-5xl ${color}`}>
        {symbol}
      </div>
    </div>
  );
}

export default function HighLowGame() {
  const [gameState, setGameState] = useState<GameState>(initGame());
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hasRecordedGame, setHasRecordedGame] = useState(false);

  // 게임 오버 시 기록
  useEffect(() => {
    if (gameState.isGameOver && !hasRecordedGame) {
      recordGamePlay({ gameType: 'high-low', score: gameState.score, won: gameState.maxStreak >= 5 });
      recordGameStats({ gameType: 'high-low', score: gameState.score, won: gameState.maxStreak >= 5 });
      setHasRecordedGame(true);
    }
  }, [gameState.isGameOver, gameState.score, gameState.maxStreak, hasRecordedGame]);

  // 추측하기
  const handleGuess = (guess: 'high' | 'low' | 'same') => {
    if (isAnimating || gameState.isGameOver) return;

    setIsAnimating(true);
    setShowResult(true);

    const newState = makeGuess(gameState, guess);
    setGameState(newState);

    setTimeout(() => {
      setIsAnimating(false);
      setShowResult(false);
    }, 1000);
  };

  // 게임 다시 시작
  const restartGame = () => {
    setGameState(initGame());
    setShowResult(false);
    setHasRecordedGame(false);
  };

  return (
    <div className="w-full">
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-xl ${i < gameState.lives ? 'text-red-500' : 'text-gray-300'}`}>
                ♥
              </span>
            ))}
          </div>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">연속: </span>
            <span className="font-bold text-orange-500">{gameState.streak}🔥</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">점수: </span>
            <span className="font-bold text-blue-600">{gameState.score}</span>
          </div>
          {gameState.highScore > 0 && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">최고: </span>
              <span className="font-bold text-amber-500">{gameState.highScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* 카드 영역 */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-lg mb-4">
        <div className="flex justify-center items-center gap-4">
          <CardDisplay card={gameState.currentCard} isNew={showResult} />
        </div>

        {/* 결과 표시 */}
        {showResult && gameState.isCorrect !== null && (
          <div className={`text-center mt-4 text-xl font-bold ${gameState.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
            {gameState.isCorrect ? '✓ 정답!' : '✗ 틀렸습니다'}
          </div>
        )}
      </div>

      {/* 추측 버튼 */}
      {!gameState.isGameOver && (
        <div className="space-y-3">
          <p className="text-center text-gray-600 dark:text-gray-400 mb-2">
            다음 카드는?
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleGuess('high')}
              disabled={isAnimating}
              className="py-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              <div className="text-2xl mb-1">📈</div>
              <div>HIGH</div>
              <div className="text-xs opacity-80">더 높다</div>
            </button>
            <button
              onClick={() => handleGuess('same')}
              disabled={isAnimating}
              className="py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              <div className="text-2xl mb-1">🎯</div>
              <div>SAME</div>
              <div className="text-xs opacity-80">같다 (x5)</div>
            </button>
            <button
              onClick={() => handleGuess('low')}
              disabled={isAnimating}
              className="py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              <div className="text-2xl mb-1">📉</div>
              <div>LOW</div>
              <div className="text-xs opacity-80">더 낮다</div>
            </button>
          </div>
        </div>
      )}

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
      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-xl max-w-sm w-full">
            <div className="text-5xl mb-4">
              {gameState.score >= 200 ? '🏆' : gameState.score >= 100 ? '🎉' : '💪'}
            </div>
            <h3 className="text-2xl font-bold mb-2">게임 오버!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {gameState.score >= 200
                ? '대단해요! 카드 마스터!'
                : gameState.score >= 100
                ? '훌륭해요!'
                : '다시 도전해보세요!'}
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">최대 연속</span>
                <span className="font-bold text-orange-500">{gameState.maxStreak}회 🔥</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">최종 점수</span>
                <span className="font-bold text-blue-600">{gameState.score}점</span>
              </div>
              {gameState.score >= gameState.highScore && gameState.score > 0 && (
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
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-colors"
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
        gameType="high-low"
        score={ScoreCalculator.highLow(gameState.score, gameState.maxStreak)}
        metadata={{ score: gameState.score, maxStreak: gameState.maxStreak }}
      />

      <style jsx>{`
        @keyframes flip {
          0% { transform: rotateY(90deg); }
          100% { transform: rotateY(0deg); }
        }
      `}</style>
    </div>
  );
}
