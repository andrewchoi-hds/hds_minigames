'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  Difficulty,
  initGame,
  makeMove,
  getAIMove,
  calculateScore,
} from '@/lib/games/tic-tac-toe';
import { recordGamePlay } from '@/lib/mission';
import { recordGameStats } from '@/lib/stats';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; description: string; color: string }> = {
  easy: { label: 'Easy', description: '이기기 쉬운 AI (입문용)', color: 'bg-green-500' },
  normal: { label: 'Normal', description: '가끔 실수하는 AI', color: 'bg-yellow-500' },
  hard: { label: 'Hard', description: '완벽한 AI (무승부 도전)', color: 'bg-red-500' },
};

type GamePhase = 'select' | 'playing';

export default function TicTacToeGame() {
  const [phase, setPhase] = useState<GamePhase>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [gameState, setGameState] = useState<GameState>(initGame());
  const [playerMark] = useState<'X' | 'O'>('X');
  const [moveCount, setMoveCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hasRecordedGame, setHasRecordedGame] = useState(false);

  // 게임 시작
  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setGameState(initGame());
    setMoveCount(0);
    setPhase('playing');
    setShowResult(false);
    setHasRecordedGame(false);
  }, []);

  // AI 턴 처리
  useEffect(() => {
    if (
      phase === 'playing' &&
      gameState.currentPlayer === 'O' &&
      !gameState.isGameOver
    ) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove([...gameState.board], difficulty);
        if (aiMove !== -1) {
          setGameState(prev => makeMove(prev, aiMove));
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, gameState.currentPlayer, gameState.isGameOver, gameState.board, difficulty]);

  // 게임 종료 처리
  useEffect(() => {
    if (gameState.isGameOver && !showResult) {
      setShowResult(true);
    }
  }, [gameState.isGameOver, showResult]);

  // 미션/통계 기록
  useEffect(() => {
    if (showResult && !hasRecordedGame) {
      const score = calculateScore(gameState.winner, playerMark, difficulty, moveCount);
      const won = gameState.winner === playerMark;
      recordGamePlay({ gameType: 'tic-tac-toe', score, won });
      recordGameStats({ gameType: 'tic-tac-toe', score, won });
      setHasRecordedGame(true);
    }
  }, [showResult, hasRecordedGame, gameState.winner, playerMark, difficulty, moveCount]);

  // 플레이어 수 두기
  const handleCellClick = (index: number) => {
    if (gameState.currentPlayer !== playerMark || gameState.isGameOver) return;
    if (gameState.board[index] !== null) return;

    setMoveCount(prev => prev + 1);
    setGameState(prev => makeMove(prev, index));
  };

  // 난이도 선택 화면
  if (phase === 'select') {
    return (
      <div className="w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⭕</div>
          <h2 className="text-2xl font-bold mb-2">틱택토</h2>
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

  const score = calculateScore(gameState.winner, playerMark, difficulty, moveCount);

  return (
    <div className="w-full">
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${DIFFICULTY_CONFIG[difficulty].color}`}>
            {DIFFICULTY_CONFIG[difficulty].label}
          </span>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">당신: </span>
            <span className="font-bold text-blue-500">X</span>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">턴: </span>
          <span className={`font-bold ${gameState.currentPlayer === 'X' ? 'text-blue-500' : 'text-red-500'}`}>
            {gameState.currentPlayer === playerMark ? '당신' : 'AI'}
          </span>
        </div>
      </div>

      {/* 게임 보드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
          {gameState.board.map((cell, index) => {
            const isWinningCell = gameState.winningLine?.includes(index);
            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || gameState.isGameOver || gameState.currentPlayer !== playerMark}
                className={`aspect-square text-5xl font-bold rounded-xl transition-all duration-200
                  ${cell === null && !gameState.isGameOver && gameState.currentPlayer === playerMark
                    ? 'bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer'
                    : 'bg-gray-100 dark:bg-gray-700'}
                  ${isWinningCell ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500' : ''}
                  ${cell === 'X' ? 'text-blue-500' : 'text-red-500'}
                `}
              >
                {cell}
              </button>
            );
          })}
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
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          다시 하기
        </button>
      </div>

      {/* 결과 모달 */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-xl max-w-sm w-full">
            <div className="text-5xl mb-4">
              {gameState.winner === playerMark ? '🎉' : gameState.winner === 'draw' ? '🤝' : '😢'}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {gameState.winner === playerMark
                ? '승리!'
                : gameState.winner === 'draw'
                ? '무승부!'
                : '패배...'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {gameState.winner === playerMark
                ? 'AI를 이겼습니다!'
                : gameState.winner === 'draw'
                ? '좋은 승부였습니다!'
                : '다시 도전해보세요!'}
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">획득 점수</span>
                <span className="font-bold text-blue-600">{score}점</span>
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
            {gameState.winner === playerMark && (
              <button
                onClick={() => setShowScoreModal(true)}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                랭킹 등록
              </button>
            )}
          </div>
        </div>
      )}

      {/* 점수 제출 모달 */}
      <ScoreSubmitModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        gameType="tic-tac-toe"
        difficulty={difficulty}
        score={ScoreCalculator.ticTacToe(gameState.winner === playerMark, difficulty, moveCount)}
        metadata={{ moveCount, winner: gameState.winner }}
      />
    </div>
  );
}
