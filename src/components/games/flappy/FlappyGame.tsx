'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  initGame,
  jump,
  updateGame,
  calculateScore,
  getGrade,
  CONSTANTS,
} from '@/lib/games/flappy';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';
import { recordGamePlay } from '@/lib/mission';
import { recordGameStats } from '@/lib/stats';

export default function FlappyGame() {
  const [gameState, setGameState] = useState<GameState>(() => initGame());
  const [bestScore, setBestScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasRecordedGame, setHasRecordedGame] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(0);

  const { GAME_WIDTH, GAME_HEIGHT, BIRD_SIZE, PIPE_WIDTH, PIPE_GAP } = CONSTANTS;

  // 로컬 스토리지에서 최고 기록 로드
  useEffect(() => {
    const saved = localStorage.getItem('flappy-best');
    if (saved) {
      setBestScore(parseInt(saved));
    }
  }, []);

  // 게임 오버 시 최고 기록 저장
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > bestScore) {
      setBestScore(gameState.score);
      localStorage.setItem('flappy-best', gameState.score.toString());
    }
  }, [gameState.isGameOver, gameState.score, bestScore]);

  // 게임 오버 시 미션/통계 기록
  useEffect(() => {
    if (gameState.isGameOver && !hasRecordedGame) {
      const finalScore = ScoreCalculator.flappy(gameState.score);
      recordGamePlay({ gameType: 'flappy', score: finalScore, won: false });
      recordGameStats({ gameType: 'flappy', score: finalScore, won: false });
      setHasRecordedGame(true);
    }
  }, [gameState.isGameOver, hasRecordedGame, gameState.score]);

  // 게임 루프 (고정 프레임레이트)
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver && !isPaused) {
      const FPS = 60;
      const frameTime = 1000 / FPS;

      const loop = (currentTime: number) => {
        if (currentTime - lastTimeRef.current >= frameTime) {
          setGameState(prev => updateGame(prev));
          lastTimeRef.current = currentTime;
        }
        gameLoopRef.current = requestAnimationFrame(loop);
      };

      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(loop);

      return () => {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
        }
      };
    }
  }, [gameState.isPlaying, gameState.isGameOver, isPaused]);

  // 점프 핸들러
  const handleJump = useCallback(() => {
    if (isPaused) return;
    setGameState(prev => jump(prev));
  }, [isPaused]);

  // 일시정지 토글
  const togglePause = useCallback(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      setIsPaused(prev => !prev);
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

      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump, isPaused, togglePause]);

  // 새 게임
  const handleNewGame = () => {
    setGameState(initGame());
    setIsPaused(false);
    setHasRecordedGame(false);
  };

  const grade = getGrade(gameState.score);
  const finalScore = calculateScore(gameState.score);

  return (
    <div className="w-full">
      {/* 점수 표시 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">점수</div>
          <div className="text-2xl font-bold font-mono">{gameState.score}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400">최고</div>
          <div className="text-lg font-bold text-blue-500">{bestScore}</div>
        </div>
      </div>

      {/* 게임 영역 */}
      <div
        ref={containerRef}
        className="relative bg-gradient-to-b from-sky-400 to-sky-200 dark:from-indigo-900 dark:to-indigo-700 rounded-xl overflow-hidden select-none cursor-pointer"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          margin: '0 auto',
          touchAction: 'none',
        }}
        onClick={handleJump}
        onTouchStart={(e) => {
          e.preventDefault();
          handleJump();
        }}
      >
        {/* 배경 구름 */}
        <div className="absolute top-8 left-1/4 text-3xl opacity-40">☁️</div>
        <div className="absolute top-20 right-1/4 text-2xl opacity-30">☁️</div>
        <div className="absolute top-32 left-1/2 text-xl opacity-20">☁️</div>

        {/* 바닥 */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600 to-green-500"
          style={{ height: 0 }}
        />

        {/* 파이프들 */}
        {gameState.pipes.map(pipe => (
          <div key={pipe.id}>
            {/* 위쪽 파이프 */}
            <div
              className="absolute bg-gradient-to-r from-green-500 to-green-600 border-4 border-green-700 rounded-b-lg"
              style={{
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.gapY - PIPE_GAP / 2,
              }}
            >
              {/* 파이프 입구 */}
              <div
                className="absolute bottom-0 left-[-4px] right-[-4px] h-6 bg-gradient-to-r from-green-400 to-green-500 border-4 border-green-700 rounded-md"
              />
            </div>
            {/* 아래쪽 파이프 */}
            <div
              className="absolute bg-gradient-to-r from-green-500 to-green-600 border-4 border-green-700 rounded-t-lg"
              style={{
                left: pipe.x,
                top: pipe.gapY + PIPE_GAP / 2,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - (pipe.gapY + PIPE_GAP / 2),
              }}
            >
              {/* 파이프 입구 */}
              <div
                className="absolute top-0 left-[-4px] right-[-4px] h-6 bg-gradient-to-r from-green-400 to-green-500 border-4 border-green-700 rounded-md"
              />
            </div>
          </div>
        ))}

        {/* 새 */}
        <div
          className="absolute transition-transform duration-75"
          style={{
            left: gameState.bird.x - BIRD_SIZE / 2,
            top: gameState.bird.y - BIRD_SIZE / 2,
            width: BIRD_SIZE,
            height: BIRD_SIZE,
            transform: `rotate(${gameState.bird.rotation}deg)`,
          }}
        >
          <div className="text-3xl">🐦</div>
        </div>

        {/* 현재 점수 (게임 중) */}
        {gameState.isPlaying && !gameState.isGameOver && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="text-4xl font-bold text-white drop-shadow-lg">
              {gameState.score}
            </div>
          </div>
        )}

        {/* 시작 화면 */}
        {!gameState.isPlaying && !gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🐦</div>
              <h2 className="text-2xl font-bold text-white mb-2">플래피 버드</h2>
              <p className="text-white/80 mb-4">탭하거나 스페이스를 눌러 시작!</p>
              <div className="text-sm text-white/60">
                터치/클릭/스페이스: 점프
              </div>
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
                onClick={(e) => {
                  e.stopPropagation();
                  togglePause();
                }}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors"
              >
                계속하기
              </button>
            </div>
          </div>
        )}

        {/* 게임 오버 */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-xl mx-4 max-w-xs w-full">
              <div className={`text-4xl font-bold mb-1 ${grade.color}`}>{grade.grade}</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{grade.description}</p>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 mb-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">통과한 파이프</div>
                <div className="text-2xl font-bold">{gameState.score}개</div>
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

      {/* 컨트롤 버튼 (모바일) */}
      <div className="mt-4 flex gap-2">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            if (!isPaused) handleJump();
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isPaused) handleJump();
          }}
          className={`flex-1 py-6 rounded-xl font-bold text-lg transition-colors ${
            isPaused
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white'
          }`}
          disabled={isPaused}
        >
          🐦 점프!
        </button>
        {gameState.isPlaying && !gameState.isGameOver && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePause();
            }}
            className={`px-6 py-6 rounded-xl font-bold text-lg transition-colors ${
              isPaused
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
        )}
      </div>

      {/* 도움말 */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm">
        <h3 className="font-semibold mb-2">게임 방법</h3>
        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
          <li>• 화면을 터치하거나 스페이스바를 눌러 점프</li>
          <li>• 파이프 사이를 통과하세요</li>
          <li>• 파이프나 바닥/천장에 부딪히면 게임 오버!</li>
          <li>• ESC 키로 일시정지할 수 있습니다</li>
        </ul>
      </div>

      {/* 점수 제출 모달 */}
      <ScoreSubmitModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        gameType="flappy"
        score={ScoreCalculator.flappy(gameState.score)}
        metadata={{
          pipesCleared: gameState.score,
        }}
      />
    </div>
  );
}
