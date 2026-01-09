'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  Difficulty,
  initGame,
  revealCell,
  toggleFlag,
  revealAdjacent,
  getDifficultyConfig,
  getNumberColor,
} from '@/lib/games/minesweeper';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; description: string; color: string }> = {
  easy: { label: 'Easy', description: '8×8, 지뢰 10개', color: 'bg-green-500' },
  normal: { label: 'Normal', description: '12×12, 지뢰 30개', color: 'bg-yellow-500' },
  hard: { label: 'Hard', description: '16×16, 지뢰 60개', color: 'bg-red-500' },
};

type GamePhase = 'select' | 'playing';

export default function MinesweeperGame() {
  const [phase, setPhase] = useState<GamePhase>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // 게임 시작
  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setGameState(initGame(diff));
    setTimer(0);
    setIsTimerRunning(false);
    setPhase('playing');
  }, []);

  // 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && gameState && !gameState.isGameOver && !gameState.isWon) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameState?.isGameOver, gameState?.isWon]);

  // 셀 클릭 (왼쪽)
  const handleCellClick = (row: number, col: number) => {
    if (!gameState || gameState.isGameOver || gameState.isWon) return;

    const cell = gameState.board[row][col];

    // 이미 열린 셀이면 주변 열기 시도
    if (cell.isRevealed) {
      setGameState(prev => prev ? revealAdjacent(prev, row, col) : prev);
      return;
    }

    // 첫 클릭이면 타이머 시작
    if (gameState.isFirstClick) {
      setIsTimerRunning(true);
    }

    setGameState(prev => prev ? revealCell(prev, row, col) : prev);
  };

  // 우클릭 (깃발)
  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (!gameState || gameState.isGameOver || gameState.isWon) return;

    setGameState(prev => prev ? toggleFlag(prev, row, col) : prev);
  };

  // 롱프레스 (모바일 깃발)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (row: number, col: number) => {
    const timer = setTimeout(() => {
      if (!gameState || gameState.isGameOver || gameState.isWon) return;
      setGameState(prev => prev ? toggleFlag(prev, row, col) : prev);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
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
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💣</div>
          <h2 className="text-2xl font-bold mb-2">지뢰찾기</h2>
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
        <div className="animate-spin w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { cols } = getDifficultyConfig(difficulty);
  const remainingMines = gameState.mines - gameState.flagsUsed;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${DIFFICULTY_CONFIG[difficulty].color}`}>
            {DIFFICULTY_CONFIG[difficulty].label}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xl">💣</span>
            <span className="font-bold text-lg">{remainingMines}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xl font-mono font-bold tabular-nums">
            {formatTime(timer)}
          </div>
          {gameState.isGameOver && (
            <span className="text-xl">💀</span>
          )}
          {gameState.isWon && (
            <span className="text-xl">🏆</span>
          )}
        </div>
      </div>

      {/* 게임 보드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-3 shadow-sm overflow-x-auto">
        <div
          className="grid gap-0.5 sm:gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            maxWidth: `${cols * 2.5}rem`,
          }}
        >
          {gameState.board.map((row, rowIdx) =>
            row.map((cell, colIdx) => (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                onContextMenu={(e) => handleCellRightClick(e, rowIdx, colIdx)}
                onTouchStart={() => handleTouchStart(rowIdx, colIdx)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                disabled={gameState.isGameOver || gameState.isWon}
                className={`aspect-square flex items-center justify-center text-xs sm:text-sm font-bold rounded transition-all select-none ${
                  cell.isRevealed
                    ? cell.isMine
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600'
                    : 'bg-gray-400 dark:bg-gray-500 hover:bg-gray-300 dark:hover:bg-gray-400 cursor-pointer'
                } ${getNumberColor(cell.adjacentMines)}`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.adjacentMines > 0 ? (
                    cell.adjacentMines
                  ) : null
                ) : cell.isFlagged ? (
                  '🚩'
                ) : null}
              </button>
            ))
          )}
        </div>
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
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          다시 하기
        </button>
      </div>

      {/* 도움말 */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
        PC: 우클릭으로 깃발 | 모바일: 길게 눌러 깃발
      </p>

      {/* 결과 모달 */}
      {(gameState.isGameOver || gameState.isWon) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-xl max-w-sm w-full">
            <div className="text-5xl mb-3">
              {gameState.isWon ? '🏆' : '💥'}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {gameState.isWon ? '승리!' : '게임 오버'}
            </h3>

            {gameState.isWon && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">클리어 시간</span>
                  <span className="font-bold">{formatTime(timer)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-500 dark:text-gray-400">점수</span>
                  <span className="font-bold text-blue-500">
                    {ScoreCalculator.minesweeper(difficulty, timer).toLocaleString()}점
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setPhase('select')}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                난이도 선택
              </button>
              {gameState.isWon ? (
                <button
                  onClick={() => {
                    setFinalScore(ScoreCalculator.minesweeper(difficulty, timer));
                    setShowScoreModal(true);
                  }}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                >
                  랭킹 등록
                </button>
              ) : (
                <button
                  onClick={() => startGame(difficulty)}
                  className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
                >
                  다시 하기
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 점수 제출 모달 */}
      <ScoreSubmitModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        gameType="minesweeper"
        difficulty={difficulty}
        score={finalScore}
        timeSeconds={timer}
      />
    </div>
  );
}
