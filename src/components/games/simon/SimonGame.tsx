'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  Color,
  COLORS,
  COLOR_STYLES,
  initGame,
  addRandomColor,
  nextShowStep,
  handlePlayerInput,
  isSequenceComplete,
} from '@/lib/games/simon';
import { recordGamePlay } from '@/lib/mission';
import { recordGameStats } from '@/lib/stats';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

export default function SimonGame() {
  const [gameState, setGameState] = useState<GameState>(initGame());
  const [activeColor, setActiveColor] = useState<Color | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hasRecordedGame, setHasRecordedGame] = useState(false);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 오디오 컨텍스트 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // 색상별 사운드 재생
  const playSound = useCallback((color: Color) => {
    if (!audioContextRef.current) return;

    const frequencies: Record<Color, number> = {
      red: 329.63,    // E4
      blue: 261.63,   // C4
      green: 392.00,  // G4
      yellow: 440.00, // A4
    };

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequencies[color];
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }, []);

  // 시퀀스 표시 로직
  useEffect(() => {
    if (!gameState.isShowingSequence || gameState.currentShowIndex < 0) {
      return;
    }

    const color = gameState.sequence[gameState.currentShowIndex];
    setActiveColor(color);
    playSound(color);

    // 레벨이 올라갈수록 속도 증가 (최소 200ms까지)
    const showDuration = Math.max(200, 600 - gameState.level * 40);
    const pauseDuration = Math.max(100, 200 - gameState.level * 10);

    sequenceTimeoutRef.current = setTimeout(() => {
      setActiveColor(null);
      setTimeout(() => {
        setGameState(prev => nextShowStep(prev));
      }, pauseDuration);
    }, showDuration);

    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, [gameState.isShowingSequence, gameState.currentShowIndex, gameState.sequence, playSound]);

  // 시퀀스 완료 시 다음 라운드
  useEffect(() => {
    if (isSequenceComplete(gameState)) {
      const timeout = setTimeout(() => {
        setGameState(prev => addRandomColor(prev));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameState]);

  // 게임 오버 시 기록
  useEffect(() => {
    if (gameState.isGameOver && !hasRecordedGame) {
      recordGamePlay({ gameType: 'simon', score: gameState.score, won: gameState.level >= 10 });
      recordGameStats({ gameType: 'simon', score: gameState.score, won: gameState.level >= 10 });
      setHasRecordedGame(true);
    }
  }, [gameState.isGameOver, gameState.score, gameState.level, hasRecordedGame]);

  // 게임 시작
  const startGame = () => {
    setGameState(addRandomColor(initGame()));
    setIsStarted(true);
    setHasRecordedGame(false);
  };

  // 색상 버튼 클릭
  const handleColorClick = (color: Color) => {
    if (gameState.isShowingSequence || gameState.isGameOver) return;

    setActiveColor(color);
    playSound(color);

    setTimeout(() => {
      setActiveColor(null);
      setGameState(prev => handlePlayerInput(prev, color));
    }, 200);
  };

  // 시작 화면
  if (!isStarted) {
    return (
      <div className="w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold mb-2">사이먼 게임</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            색깔 패턴을 기억하고 따라하세요
          </p>
          {gameState.highScore > 0 && (
            <p className="text-sm text-amber-500">
              🏆 최고 기록: {gameState.highScore}점 (레벨 {Math.floor((-1 + Math.sqrt(1 + 8 * gameState.highScore / 10)) / 2)})
            </p>
          )}
        </div>

        <button
          onClick={startGame}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
        >
          게임 시작
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">레벨: </span>
            <span className="font-bold">{gameState.level}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">점수: </span>
            <span className="font-bold text-purple-600">{gameState.score}</span>
          </div>
          {gameState.highScore > 0 && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">최고: </span>
              <span className="font-bold text-amber-500">{gameState.highScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* 게임 상태 표시 */}
      <div className="text-center mb-4">
        {gameState.isShowingSequence ? (
          <p className="text-lg font-medium text-purple-600 dark:text-purple-400 animate-pulse">
            👀 패턴을 기억하세요...
          </p>
        ) : (
          <p className="text-lg font-medium text-green-600 dark:text-green-400">
            👆 따라해보세요! ({gameState.playerSequence.length}/{gameState.sequence.length})
          </p>
        )}
      </div>

      {/* 사이먼 버튼 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 max-w-[280px] mx-auto">
          {COLORS.map(color => {
            const styles = COLOR_STYLES[color];
            const isActive = activeColor === color;
            return (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                disabled={gameState.isShowingSequence || gameState.isGameOver}
                className={`aspect-square rounded-2xl border-4 transition-all duration-150
                  ${styles.border}
                  ${isActive ? styles.active : styles.bg}
                  ${!gameState.isShowingSequence && !gameState.isGameOver ? 'hover:opacity-80 active:scale-95' : ''}
                  disabled:cursor-not-allowed
                `}
                aria-label={color}
              />
            );
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={startGame}
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
              {gameState.level >= 10 ? '🏆' : gameState.level >= 5 ? '👏' : '💪'}
            </div>
            <h3 className="text-2xl font-bold mb-2">게임 오버!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {gameState.level >= 10
                ? '대단해요! 마스터 레벨!'
                : gameState.level >= 5
                ? '잘했어요!'
                : '다시 도전해보세요!'}
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">도달 레벨</span>
                <span className="font-bold">{gameState.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">획득 점수</span>
                <span className="font-bold text-purple-600">{gameState.score}점</span>
              </div>
              {gameState.score >= gameState.highScore && (
                <div className="text-amber-500 font-bold text-sm mt-2">
                  🎉 새로운 최고 기록!
                </div>
              )}
            </div>

            <div className="flex gap-3 mb-3">
              <button
                onClick={startGame}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                다시 하기
              </button>
              <button
                onClick={() => setShowScoreModal(true)}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
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
        gameType="simon"
        score={ScoreCalculator.simon(gameState.level)}
        metadata={{ level: gameState.level, score: gameState.score }}
      />
    </div>
  );
}
