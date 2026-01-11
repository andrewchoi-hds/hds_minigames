'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  initGame,
  startGame,
  movePaddle,
  updateGame,
  calculateScore,
  getGrade,
  CONSTANTS,
} from '@/lib/games/breakout';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

const { GAME_WIDTH, GAME_HEIGHT, BRICK_ROWS, BRICK_COLS } = CONSTANTS;

export default function BreakoutGame() {
  const [gameState, setGameState] = useState<GameState>(() => initGame());
  const [bestScore, setBestScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalBricks = BRICK_ROWS * BRICK_COLS;

  // 로컬 스토리지에서 최고 기록 로드
  useEffect(() => {
    const saved = localStorage.getItem('breakout-best');
    if (saved) {
      setBestScore(parseInt(saved));
    }
  }, []);

  // 게임 오버 시 최고 기록 저장
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > bestScore) {
      setBestScore(gameState.score);
      localStorage.setItem('breakout-best', gameState.score.toString());
    }
  }, [gameState.isGameOver, gameState.score, bestScore]);

  // 게임 루프
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      const loop = () => {
        setGameState(prev => updateGame(prev));
        gameLoopRef.current = requestAnimationFrame(loop);
      };
      gameLoopRef.current = requestAnimationFrame(loop);

      return () => {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
        }
      };
    }
  }, [gameState.isPlaying, gameState.isGameOver]);

  // 마우스/터치 핸들러
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    setGameState(prev => movePaddle(prev, x));
  }, []);

  const handleClick = useCallback(() => {
    if (!gameState.isPlaying && !gameState.isGameOver && gameState.ball.dy === 0) {
      setGameState(prev => startGame(prev));
    }
  }, [gameState.isPlaying, gameState.isGameOver, gameState.ball.dy]);

  // 마우스 이벤트
  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  // 터치 이벤트
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  // 새 게임
  const handleNewGame = () => {
    setGameState(initGame());
  };

  const grade = getGrade(gameState.score);
  const bricksCleared = totalBricks - gameState.bricks.length;
  const finalScore = calculateScore(gameState.score, bricksCleared, gameState.maxCombo);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 점수 표시 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">점수</div>
            <div className="text-2xl font-bold font-mono">{gameState.score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">목숨</div>
            <div className="text-xl font-bold text-red-500">
              {'❤️'.repeat(gameState.lives)}{'🖤'.repeat(Math.max(0, 3 - gameState.lives))}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400">최고</div>
          <div className="text-lg font-bold text-blue-500">{bestScore.toLocaleString()}</div>
        </div>
      </div>

      {/* 게임 영역 */}
      <div
        ref={containerRef}
        className="relative bg-gray-900 rounded-xl overflow-hidden select-none mx-auto cursor-none"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          touchAction: 'none',
        }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onTouchMove={handleTouchMove}
        onTouchStart={(e) => {
          e.preventDefault();
          handleMove(e.touches[0].clientX);
          if (!gameState.isPlaying && gameState.ball.dy === 0) {
            handleClick();
          }
        }}
      >
        {/* 벽돌 */}
        {gameState.bricks.map(brick => (
          <div
            key={brick.id}
            className="absolute rounded-sm transition-all duration-75"
            style={{
              left: brick.x,
              top: brick.y,
              width: brick.width,
              height: brick.height,
              backgroundColor: brick.color,
              opacity: brick.hits > 1 ? 1 : 0.8,
              boxShadow: brick.hits > 1 ? 'inset 0 -2px 4px rgba(0,0,0,0.3)' : undefined,
            }}
          >
            {brick.hits > 1 && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs font-bold">
                {brick.hits}
              </div>
            )}
          </div>
        ))}

        {/* 패들 */}
        <div
          className="absolute bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"
          style={{
            left: gameState.paddle.x,
            top: gameState.paddle.y,
            width: gameState.paddle.width,
            height: gameState.paddle.height,
          }}
        />

        {/* 공 */}
        <div
          className="absolute bg-white rounded-full shadow-lg"
          style={{
            left: gameState.ball.x - gameState.ball.radius,
            top: gameState.ball.y - gameState.ball.radius,
            width: gameState.ball.radius * 2,
            height: gameState.ball.radius * 2,
          }}
        />

        {/* 파워업 */}
        {gameState.powerUps.map(powerUp => (
          <div
            key={powerUp.id}
            className="absolute text-lg"
            style={{
              left: powerUp.x - 10,
              top: powerUp.y,
            }}
          >
            {powerUp.type === 'wide' && '📏'}
            {powerUp.type === 'life' && '❤️'}
            {powerUp.type === 'multi' && '💎'}
          </div>
        ))}

        {/* 콤보 표시 - 게임 영역 내부 고정 */}
        {gameState.isPlaying && !gameState.isGameOver && gameState.combo > 0 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <span className="bg-yellow-400/90 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              🔥 {gameState.combo} COMBO!
            </span>
          </div>
        )}

        {/* 시작 안내 */}
        {!gameState.isPlaying && !gameState.isGameOver && gameState.ball.dy === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-center">
              <div className="text-5xl mb-4">🧱</div>
              <h2 className="text-xl font-bold text-white mb-2">벽돌깨기</h2>
              <p className="text-white/80 text-sm mb-3">마우스/터치로 패들 조종</p>
              <p className="text-white/60 text-xs">클릭하여 시작!</p>
            </div>
          </div>
        )}

        {/* 게임 오버 / 승리 */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-xl mx-4 max-w-xs w-full">
              {gameState.isWin ? (
                <>
                  <div className="text-5xl mb-2">🎉</div>
                  <h3 className="text-xl font-bold text-green-500 mb-2">클리어!</h3>
                </>
              ) : (
                <>
                  <div className={`text-4xl font-bold mb-1 ${grade.color}`}>{grade.grade}</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{grade.description}</p>
                </>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">벽돌</div>
                  <div className="font-bold">{bricksCleared}/{totalBricks}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">최대 콤보</div>
                  <div className="font-bold text-orange-500">🔥 {gameState.maxCombo}</div>
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

      {/* 도움말 */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm">
        <h3 className="font-semibold mb-2">게임 방법</h3>
        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
          <li>• 마우스/터치로 패들을 좌우로 움직이세요</li>
          <li>• 공을 튕겨 모든 벽돌을 깨세요</li>
          <li>• 연속으로 벽돌을 깨면 콤보 보너스!</li>
          <li>• 파워업: 📏 패들 확장 | ❤️ 목숨 추가 | 💎 보너스</li>
        </ul>
      </div>

      {/* 점수 제출 모달 */}
      <ScoreSubmitModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        gameType="breakout"
        score={ScoreCalculator.breakout(gameState.score, bricksCleared, gameState.maxCombo)}
        metadata={{
          bricksCleared,
          totalBricks,
          maxCombo: gameState.maxCombo,
          cleared: gameState.isWin,
        }}
      />
    </div>
  );
}
