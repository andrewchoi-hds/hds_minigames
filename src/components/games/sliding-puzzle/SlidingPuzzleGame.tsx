'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  Difficulty,
  initGame,
  moveTile,
  moveByDirection,
  getMovableTiles,
  getDifficultyConfig,
  getTileColor,
} from '@/lib/games/sliding-puzzle';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

const DIFFICULTY_OPTIONS: { key: Difficulty; color: string }[] = [
  { key: '3x3', color: 'bg-green-500' },
  { key: '4x4', color: 'bg-yellow-500' },
  { key: '5x5', color: 'bg-red-500' },
];

export default function SlidingPuzzleGame() {
  const [phase, setPhase] = useState<'select' | 'playing'>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('4x4');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timer, setTimer] = useState(0);
  const [bestRecords, setBestRecords] = useState<Record<Difficulty, { moves: number; time: number } | null>>({
    '3x3': null,
    '4x4': null,
    '5x5': null,
  });
  const [showScoreModal, setShowScoreModal] = useState(false);

  // 로컬 스토리지에서 최고 기록 로드
  useEffect(() => {
    const saved = localStorage.getItem('sliding-puzzle-best');
    if (saved) {
      setBestRecords(JSON.parse(saved));
    }
  }, []);

  // 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState && gameState.startTime && !gameState.isWon) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - gameState.startTime!) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState?.startTime, gameState?.isWon]);

  // 게임 시작
  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setGameState(initGame(diff));
    setTimer(0);
    setPhase('playing');
  }, []);

  // 기록 저장
  const saveRecord = useCallback(
    (diff: Difficulty, moves: number, time: number) => {
      const current = bestRecords[diff];
      if (!current || moves < current.moves || (moves === current.moves && time < current.time)) {
        const newRecords = {
          ...bestRecords,
          [diff]: { moves, time },
        };
        setBestRecords(newRecords);
        localStorage.setItem('sliding-puzzle-best', JSON.stringify(newRecords));
      }
    },
    [bestRecords]
  );

  // 승리 처리
  useEffect(() => {
    if (gameState?.isWon && gameState.startTime) {
      const time = Math.floor((Date.now() - gameState.startTime) / 1000);
      saveRecord(difficulty, gameState.moves, time);
    }
  }, [gameState?.isWon, gameState?.moves, gameState?.startTime, difficulty, saveRecord]);

  // 타일 클릭
  const handleTileClick = (index: number) => {
    if (!gameState) return;
    setGameState((prev) => (prev ? moveTile(prev, index) : prev));
  };

  // 키보드 입력
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'playing' || !gameState) return;

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;

      switch (e.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
      }

      if (direction) {
        e.preventDefault();
        setGameState((prev) => (prev ? moveByDirection(prev, direction!) : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, gameState]);

  // 시간 포맷
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
          <div className="text-6xl mb-4">🧩</div>
          <h2 className="text-2xl font-bold mb-2">슬라이딩 퍼즐</h2>
          <p className="text-gray-500 dark:text-gray-400">숫자를 순서대로 정렬하세요</p>
        </div>

        <div className="space-y-3">
          {DIFFICULTY_OPTIONS.map(({ key, color }) => {
            const config = getDifficultyConfig(key);
            const best = bestRecords[key];

            return (
              <button
                key={key}
                onClick={() => startGame(key)}
                className="w-full p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-lg group-hover:text-blue-500 transition-colors">
                      {config.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {config.description}
                      {best && (
                        <span className="ml-2 text-blue-500">
                          최고: {best.moves}회 / {formatTime(best.time)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-500 transition-colors">→</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 게임 방법 */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm">
          <h3 className="font-semibold mb-2">게임 방법</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• 타일을 클릭하거나 방향키로 이동</li>
            <li>• 숫자를 1부터 순서대로 정렬</li>
            <li>• 최소 이동 횟수로 완성하세요</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!gameState) return null;

  const config = getDifficultyConfig(difficulty);
  const movable = getMovableTiles(gameState.board, gameState.size);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${
              DIFFICULTY_OPTIONS.find((d) => d.key === difficulty)?.color
            }`}
          >
            {config.label}
          </span>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">이동: </span>
            <span className="font-bold">{gameState.moves}</span>
          </div>
        </div>
        <div className="text-xl font-mono font-bold tabular-nums">{formatTime(timer)}</div>
      </div>

      {/* 게임 보드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
        <div
          className="grid gap-1.5 sm:gap-2 mx-auto aspect-square"
          style={{
            gridTemplateColumns: `repeat(${gameState.size}, 1fr)`,
            maxWidth: '320px',
          }}
        >
          {gameState.board.map((value, index) => {
            const isMovable = movable.includes(index);
            const isEmpty = value === 0;

            return (
              <button
                key={index}
                onClick={() => handleTileClick(index)}
                disabled={isEmpty || gameState.isWon}
                className={`aspect-square flex items-center justify-center font-bold rounded-lg transition-all select-none ${
                  isEmpty
                    ? 'bg-gray-100 dark:bg-gray-700/50'
                    : `${getTileColor(value, gameState.size)} ${
                        isMovable
                          ? 'cursor-pointer hover:scale-105 hover:shadow-lg'
                          : 'cursor-default'
                      }`
                } ${
                  gameState.size === 3
                    ? 'text-3xl'
                    : gameState.size === 4
                    ? 'text-2xl'
                    : 'text-xl'
                }`}
              >
                {isEmpty ? '' : value}
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
          다시 섞기
        </button>
      </div>

      {/* 도움말 */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
        타일 클릭 또는 방향키로 이동
      </p>

      {/* 승리 모달 */}
      {gameState.isWon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-xl max-w-sm w-full">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-2xl font-bold mb-2">완성!</h3>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">난이도</span>
                <span className="font-bold">{config.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">이동 횟수</span>
                <span className="font-bold">{gameState.moves}회</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">소요 시간</span>
                <span className="font-bold">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">점수</span>
                <span className="font-bold text-blue-500">
                  {ScoreCalculator.slidingPuzzle(difficulty, gameState.moves, timer).toLocaleString()}점
                </span>
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
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
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
        gameType="sliding-puzzle"
        difficulty={difficulty}
        score={ScoreCalculator.slidingPuzzle(difficulty, gameState?.moves || 0, timer)}
        timeSeconds={timer}
        metadata={{ moves: gameState?.moves }}
      />
    </div>
  );
}
