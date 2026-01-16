'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  Direction,
  initGame,
  startGame,
  changeDirection,
  updateGame,
  calculateScore,
  getGrade,
  CONSTANTS,
} from '@/lib/games/snake';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';
import { recordGamePlay } from '@/lib/mission';
import { recordGameStats } from '@/lib/stats';

const CELL_SIZE = 20;

export default function SnakeGame() {
  const [gameState, setGameState] = useState<GameState>(() => initGame());
  const [bestScore, setBestScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasRecordedGame, setHasRecordedGame] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { DEFAULT_GRID_SIZE } = CONSTANTS;

  // 로컬 스토리지에서 최고 기록 로드
  useEffect(() => {
    const saved = localStorage.getItem('snake-best');
    if (saved) {
      setBestScore(parseInt(saved));
    }
  }, []);

  // 게임 오버 시 최고 기록 저장
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > bestScore) {
      setBestScore(gameState.score);
      localStorage.setItem('snake-best', gameState.score.toString());
    }
  }, [gameState.isGameOver, gameState.score, bestScore]);

  // 게임 오버 시 미션/통계 기록
  useEffect(() => {
    if (gameState.isGameOver && !hasRecordedGame) {
      const finalScore = ScoreCalculator.snake(gameState.score, gameState.snake.length);
      recordGamePlay({ gameType: 'snake', score: finalScore, won: false });
      recordGameStats({ gameType: 'snake', score: finalScore, won: false });
      setHasRecordedGame(true);
    }
  }, [gameState.isGameOver, hasRecordedGame, gameState.score, gameState.snake.length]);

  // 게임 루프
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        setGameState((prev) => updateGame(prev));
      }, gameState.speed);

      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [gameState.isPlaying, gameState.isGameOver, gameState.speed, isPaused]);

  // 방향 변경 핸들러
  const handleChangeDirection = useCallback((direction: Direction) => {
    setGameState((prev) => changeDirection(prev, direction));
  }, []);

  // 일시정지 토글
  const togglePause = useCallback(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      setIsPaused((prev) => !prev);
    }
  }, [gameState.isPlaying, gameState.isGameOver]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape 키: 일시정지 토글
      if (e.key === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
      }

      // 일시정지 중에는 다른 키 무시
      if (isPaused) return;

      if (!gameState.isPlaying && !gameState.isGameOver) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          setGameState((prev) => startGame(prev));
          return;
        }
      }

      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          e.preventDefault();
          handleChangeDirection('up');
          break;
        case 'arrowdown':
        case 's':
          e.preventDefault();
          handleChangeDirection('down');
          break;
        case 'arrowleft':
        case 'a':
          e.preventDefault();
          handleChangeDirection('left');
          break;
        case 'arrowright':
        case 'd':
          e.preventDefault();
          handleChangeDirection('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, gameState.isGameOver, handleChangeDirection, isPaused, togglePause]);

  // 새 게임
  const handleNewGame = () => {
    setGameState(initGame());
    setIsPaused(false);
    setHasRecordedGame(false);
  };

  // 터치 이벤트
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;

    // 최소 스와이프 거리
    if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
      // 탭 = 게임 시작
      if (!gameState.isPlaying && !gameState.isGameOver) {
        setGameState((prev) => startGame(prev));
      }
      return;
    }

    // 스와이프 방향 감지
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      handleChangeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      handleChangeDirection(deltaY > 0 ? 'down' : 'up');
    }

    touchStartRef.current = null;
  };

  const grade = getGrade(gameState.score);
  const finalScore = calculateScore(gameState.score, gameState.snake.length);
  const gridSizePx = DEFAULT_GRID_SIZE * CELL_SIZE;

  return (
    <div className="w-full">
      {/* 점수 표시 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">사과</div>
            <div className="text-2xl font-bold font-mono">🍎 {gameState.score}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">길이</div>
            <div className="text-xl font-bold text-green-500">{gameState.snake.length}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400">최고</div>
          <div className="text-lg font-bold text-blue-500">{bestScore}</div>
        </div>
      </div>

      {/* 게임 영역 */}
      <div
        ref={containerRef}
        className="relative bg-gray-900 rounded-xl overflow-hidden select-none mx-auto"
        style={{
          width: gridSizePx,
          height: gridSizePx,
          touchAction: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 격자 */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #fff 1px, transparent 1px),
              linear-gradient(to bottom, #fff 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        />

        {/* 뱀 */}
        {gameState.snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute rounded-sm transition-all duration-75 ${
              index === 0
                ? 'bg-green-400 z-10'
                : 'bg-green-500'
            }`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
            }}
          >
            {index === 0 && (
              <div className="w-full h-full flex items-center justify-center text-xs">
                {gameState.direction === 'up' && '👆'}
                {gameState.direction === 'down' && '👇'}
                {gameState.direction === 'left' && '👈'}
                {gameState.direction === 'right' && '👉'}
              </div>
            )}
          </div>
        ))}

        {/* 음식 */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: gameState.food.x * CELL_SIZE,
            top: gameState.food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        >
          <span className="text-sm animate-pulse">🍎</span>
        </div>

        {/* 시작 화면 */}
        {!gameState.isPlaying && !gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <div className="text-5xl mb-4">🐍</div>
              <h2 className="text-xl font-bold text-white mb-2">뱀 게임</h2>
              <p className="text-white/80 text-sm mb-3">화살표 또는 WASD로 조작</p>
              <p className="text-white/60 text-xs">아무 키나 눌러 시작!</p>
            </div>
          </div>
        )}

        {/* 일시정지 화면 */}
        {isPaused && !gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
            <div className="text-center">
              <div className="text-5xl mb-4">⏸️</div>
              <h2 className="text-2xl font-bold text-white mb-2">일시정지</h2>
              <p className="text-white/80 text-sm mb-4">ESC 또는 버튼을 눌러 계속하기</p>
              <button
                onClick={togglePause}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
              >
                계속하기
              </button>
            </div>
          </div>
        )}

        {/* 게임 오버 */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-xl mx-4 max-w-xs w-full">
              <div className={`text-4xl font-bold mb-1 ${grade.color}`}>{grade.grade}</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{grade.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">사과</div>
                  <div className="font-bold">🍎 {gameState.score}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">길이</div>
                  <div className="font-bold text-green-500">{gameState.snake.length}</div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-3 mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">최종 점수</div>
                <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {finalScore.toLocaleString()}점
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNewGame();
                  }}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  다시 하기
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowScoreModal(true);
                  }}
                  className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                >
                  랭킹 등록
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 모바일 컨트롤 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div />
        <button
          onClick={() => handleChangeDirection('up')}
          className="py-4 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold text-2xl active:bg-gray-300 dark:active:bg-gray-600 transition-colors"
        >
          ⬆️
        </button>
        <div />
        <button
          onClick={() => handleChangeDirection('left')}
          className="py-4 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold text-2xl active:bg-gray-300 dark:active:bg-gray-600 transition-colors"
        >
          ⬅️
        </button>
        <button
          onClick={() => {
            if (!gameState.isPlaying && !gameState.isGameOver) {
              setGameState((prev) => startGame(prev));
            } else if (gameState.isPlaying && !gameState.isGameOver) {
              togglePause();
            }
          }}
          className={`py-4 rounded-xl font-bold transition-colors ${
            isPaused
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : gameState.isPlaying
              ? 'bg-gray-500 hover:bg-gray-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isPaused ? '▶️' : gameState.isPlaying ? '⏸️' : 'GO'}
        </button>
        <button
          onClick={() => handleChangeDirection('right')}
          className="py-4 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold text-2xl active:bg-gray-300 dark:active:bg-gray-600 transition-colors"
        >
          ➡️
        </button>
        <div />
        <button
          onClick={() => handleChangeDirection('down')}
          className="py-4 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold text-2xl active:bg-gray-300 dark:active:bg-gray-600 transition-colors"
        >
          ⬇️
        </button>
        <div />
      </div>

      {/* 도움말 */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm">
        <h3 className="font-semibold mb-2">게임 방법</h3>
        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
          <li>• 화살표 키 또는 WASD로 뱀을 조종하세요</li>
          <li>• 🍎 사과를 먹으면 뱀이 길어집니다</li>
          <li>• 벽이나 자기 몸에 부딪히면 게임 오버!</li>
          <li>• ESC 키로 일시정지할 수 있습니다</li>
        </ul>
      </div>

      {/* 점수 제출 모달 */}
      <ScoreSubmitModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        gameType="snake"
        score={ScoreCalculator.snake(gameState.score, gameState.snake.length)}
        metadata={{
          applesEaten: gameState.score,
          snakeLength: gameState.snake.length,
        }}
      />
    </div>
  );
}
