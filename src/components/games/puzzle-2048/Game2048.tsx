'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  Direction,
  initGame,
  move,
  getTileColor,
  getTileFontSize,
} from '@/lib/games/puzzle-2048';

const STORAGE_KEY_SCORE = '2048-best-score';
const STORAGE_KEY_TILE = '2048-best-tile';

export default function Game2048() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState<number | null>(null);

  // 초기화
  useEffect(() => {
    const bestScore = parseInt(localStorage.getItem(STORAGE_KEY_SCORE) || '0', 10);
    const bestTile = parseInt(localStorage.getItem(STORAGE_KEY_TILE) || '0', 10);
    setGameState(initGame(bestScore, bestTile));
  }, []);

  // 최고 점수/타일 저장
  useEffect(() => {
    if (gameState) {
      localStorage.setItem(STORAGE_KEY_SCORE, gameState.bestScore.toString());
      localStorage.setItem(STORAGE_KEY_TILE, gameState.bestTile.toString());
    }
  }, [gameState?.bestScore, gameState?.bestTile]);

  // 마일스톤 달성 모달
  useEffect(() => {
    if (gameState?.milestoneReached) {
      setShowMilestoneModal(gameState.milestoneReached);
      // 마일스톤 표시 후 상태 리셋
      setGameState(prev => prev ? { ...prev, milestoneReached: null } : prev);
    }
  }, [gameState?.milestoneReached]);

  // 키보드 입력
  const handleMove = useCallback((direction: Direction) => {
    if (!gameState || gameState.isGameOver) return;
    setGameState(prev => prev ? move(prev, direction) : prev);
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState || showMilestoneModal) return;

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleMove, showMilestoneModal]);

  // 터치 입력
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 스와이프 중 스크롤 방지
    if (touchStart) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || showMilestoneModal) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipe = 30; // 더 민감하게 조정

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // 최소 스와이프 거리 확인
    if (absDeltaX < minSwipe && absDeltaY < minSwipe) {
      setTouchStart(null);
      return;
    }

    if (absDeltaX > absDeltaY) {
      handleMove(deltaX > 0 ? 'right' : 'left');
    } else {
      handleMove(deltaY > 0 ? 'down' : 'up');
    }

    setTouchStart(null);
  };

  // 새 게임
  const handleNewGame = () => {
    const bestScore = gameState?.bestScore || 0;
    const bestTile = gameState?.bestTile || 0;
    setGameState(initGame(bestScore, bestTile));
    setShowMilestoneModal(null);
  };

  // 현재 최대 타일 값
  const currentMaxTile = gameState ? Math.max(...gameState.tiles.map(t => t.value)) : 0;

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 점수 영역 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-4xl font-bold text-amber-600 dark:text-amber-500">2048</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            최고 타일: <span className="font-bold text-amber-600">{gameState.bestTile || '-'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-amber-100 dark:bg-amber-900/50 rounded-lg px-3 py-2 text-center min-w-[70px]">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">SCORE</div>
            <div className="text-lg font-bold text-amber-800 dark:text-amber-200">{gameState.score}</div>
          </div>
          <div className="bg-amber-100 dark:bg-amber-900/50 rounded-lg px-3 py-2 text-center min-w-[70px]">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">BEST</div>
            <div className="text-lg font-bold text-amber-800 dark:text-amber-200">{gameState.bestScore}</div>
          </div>
        </div>
      </div>

      {/* 게임 보드 */}
      <div
        className="relative bg-amber-200 dark:bg-amber-900/60 rounded-xl p-2 sm:p-3 select-none"
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 그리드 배경 */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {Array(16).fill(null).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-amber-300/50 dark:bg-amber-800/50 rounded-lg"
            />
          ))}
        </div>

        {/* 타일 */}
        <div className="absolute inset-2 sm:inset-3">
          {gameState.tiles.map(tile => {
            const { bg, text } = getTileColor(tile.value);
            const fontSize = getTileFontSize(tile.value);
            const cellSize = 'calc((100% - 1.5rem) / 4)';
            const gapSize = '0.5rem';

            return (
              <div
                key={tile.id}
                className={`absolute flex items-center justify-center rounded-lg font-bold transition-all duration-100 ${bg} ${text} ${fontSize} ${tile.isNew ? 'animate-pop' : ''} ${tile.isMerged ? 'animate-merge' : ''}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  left: `calc(${tile.col} * (${cellSize} + ${gapSize}))`,
                  top: `calc(${tile.row} * (${cellSize} + ${gapSize}))`,
                }}
              >
                {tile.value}
              </div>
            );
          })}
        </div>

        {/* 게임 오버 오버레이 */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-xl mx-4">
              <div className="text-4xl mb-3">😢</div>
              <h3 className="text-2xl font-bold mb-2">Game Over</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                최종 점수: <span className="font-bold text-amber-600">{gameState.score}</span>
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                최고 타일: <span className="font-bold text-amber-600">{currentMaxTile}</span>
              </p>
              <button
                onClick={handleNewGame}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
              >
                다시 하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 컨트롤 */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleNewGame}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
        >
          새 게임
        </button>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          ←↑↓→ 또는 스와이프
        </div>
      </div>

      {/* 마일스톤 달성 모달 */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-xl max-w-sm w-full">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-3xl font-bold mb-2 text-amber-600">{showMilestoneModal}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {showMilestoneModal === 2048
                ? '축하합니다! 2048을 달성했습니다!'
                : `대단해요! ${showMilestoneModal} 타일을 만들었습니다!`}
              <br />
              <span className="text-sm">계속해서 더 높은 타일에 도전하세요!</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleNewGame}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                새 게임
              </button>
              <button
                onClick={() => setShowMilestoneModal(null)}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
              >
                계속하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
