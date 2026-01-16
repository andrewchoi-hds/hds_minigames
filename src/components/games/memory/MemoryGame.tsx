'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  Difficulty,
  initGame,
  flipCard,
  checkMatch,
  getDifficultyConfig,
  calculateStars,
  calculateScore,
} from '@/lib/games/memory';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';
import { recordGamePlay } from '@/lib/mission';
import { recordGameStats } from '@/lib/stats';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; description: string; color: string }> = {
  easy: { label: 'Easy', description: '6쌍 (3×4)', color: 'bg-green-500' },
  normal: { label: 'Normal', description: '8쌍 (4×4)', color: 'bg-yellow-500' },
  hard: { label: 'Hard', description: '12쌍 (4×6)', color: 'bg-red-500' },
};

type GamePhase = 'select' | 'playing';

export default function MemoryGame() {
  const [phase, setPhase] = useState<GamePhase>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timer, setTimer] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hasRecordedGame, setHasRecordedGame] = useState(false);

  // 게임 완료 시 미션/통계 기록
  useEffect(() => {
    if (showResult && gameState?.isComplete && !hasRecordedGame) {
      const finalScore = ScoreCalculator.memory(difficulty, gameState.moves, timer);
      recordGamePlay({ gameType: 'memory', score: finalScore, won: true });
      recordGameStats({ gameType: 'memory', score: finalScore, won: true });
      setHasRecordedGame(true);
    }
  }, [showResult, gameState?.isComplete, hasRecordedGame, difficulty, gameState?.moves, timer]);

  // 게임 시작
  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setGameState(initGame(diff));
    setTimer(0);
    setPhase('playing');
    setShowResult(false);
    setHasRecordedGame(false);
  }, []);

  // 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === 'playing' && gameState && !gameState.isComplete) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, gameState?.isComplete]);

  // 카드 클릭
  const handleCardClick = (cardId: number) => {
    if (!gameState || isChecking || gameState.isComplete) return;

    const newState = flipCard(gameState, cardId);

    // 변화가 없으면 무시
    if (newState === gameState) return;

    setGameState(newState);

    // 2장 뒤집혔으면 매치 확인
    if (newState.flippedCards.length === 2) {
      setIsChecking(true);
      setTimeout(() => {
        setGameState(prev => {
          if (!prev) return prev;
          const checked = checkMatch(prev);
          if (checked.isComplete) {
            setShowResult(true);
          }
          return checked;
        });
        setIsChecking(false);
      }, 800);
    }
  };

  // 타이머 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 난이도 선택 화면
  if (phase === 'select') {
    return (
      <div className="w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🃏</div>
          <h2 className="text-2xl font-bold mb-2">메모리 게임</h2>
          <p className="text-gray-500 dark:text-gray-400">난이도를 선택하세요</p>
        </div>

        <div className="space-y-3">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => startGame(diff)}
              className="w-full p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${DIFFICULTY_CONFIG[diff].color}`} />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg group-hover:text-blue-500 transition-colors">
                    {DIFFICULTY_CONFIG[diff].label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {DIFFICULTY_CONFIG[diff].description}
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { cols } = getDifficultyConfig(difficulty);
  const stars = gameState.isComplete ? calculateStars(gameState.moves, gameState.totalPairs) : 0;
  const score = gameState.isComplete ? calculateScore(gameState.moves, gameState.totalPairs, timer) : 0;

  return (
    <div className="w-full">
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${DIFFICULTY_CONFIG[difficulty].color}`}>
            {DIFFICULTY_CONFIG[difficulty].label}
          </span>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">시도: </span>
            <span className="font-bold">{gameState.moves}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">매치: </span>
            <span className="font-bold">{gameState.matches}/{gameState.totalPairs}</span>
          </div>
          <div className="text-xl font-mono font-bold tabular-nums">
            {formatTime(timer)}
          </div>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div
        className="grid gap-2 sm:gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {gameState.cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched || isChecking}
            className={`aspect-square rounded-xl text-3xl sm:text-4xl flex items-center justify-center transition-all duration-300 transform ${
              card.isFlipped || card.isMatched
                ? 'bg-white dark:bg-gray-700 rotate-0 scale-100'
                : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 cursor-pointer hover:scale-105'
            } ${card.isMatched ? 'opacity-60' : ''}`}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {card.isFlipped || card.isMatched ? (
              <span className={card.isMatched ? 'opacity-50' : ''}>{card.icon}</span>
            ) : (
              <span className="text-white text-2xl">?</span>
            )}
          </button>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={() => setPhase('select')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          난이도 변경
        </button>
        <button
          onClick={() => startGame(difficulty)}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
        >
          다시 하기
        </button>
      </div>

      {/* 결과 모달 */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-xl max-w-sm w-full">
            <div className="text-5xl mb-2">
              {stars === 3 ? '🏆' : stars === 2 ? '🎉' : '👏'}
            </div>
            <div className="text-3xl mb-3">
              {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
            </div>
            <h3 className="text-2xl font-bold mb-4">완료!</h3>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">시도 횟수</span>
                <span className="font-bold">{gameState.moves}회</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">소요 시간</span>
                <span className="font-bold">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">점수</span>
                <span className="font-bold text-purple-600">{score.toLocaleString()}점</span>
              </div>
            </div>

            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setPhase('select')}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                난이도 선택
              </button>
              <button
                onClick={() => startGame(difficulty)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                다시 하기
              </button>
            </div>
            <button
              onClick={() => setShowScoreModal(true)}
              className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
            >
              랭킹 등록
            </button>
          </div>
        </div>
      )}

      {/* 점수 제출 모달 */}
      <ScoreSubmitModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        gameType="memory"
        difficulty={difficulty}
        score={ScoreCalculator.memory(difficulty, gameState?.moves || 0, timer)}
        timeSeconds={timer}
        metadata={{ moves: gameState?.moves, stars }}
      />
    </div>
  );
}
