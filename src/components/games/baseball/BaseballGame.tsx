'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  Difficulty,
  initGame,
  submitGuess,
  updateCurrentGuess,
  deleteLastDigit,
  isValidGuess,
  getHintText,
  getResultColor,
  getDifficultyConfig,
} from '@/lib/games/baseball';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

const DIFFICULTY_OPTIONS: { key: Difficulty; color: string }[] = [
  { key: '3digit', color: 'bg-green-500' },
  { key: '4digit', color: 'bg-orange-500' },
];

export default function BaseballGame() {
  const [phase, setPhase] = useState<'select' | 'playing'>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('3digit');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string>('');
  const [timer, setTimer] = useState(0);
  const [bestRecords, setBestRecords] = useState<Record<Difficulty, number | null>>({
    '3digit': null,
    '4digit': null,
  });
  const [showScoreModal, setShowScoreModal] = useState(false);

  // 로컬 스토리지에서 최고 기록 로드
  useEffect(() => {
    const saved = localStorage.getItem('baseball-best');
    if (saved) {
      setBestRecords(JSON.parse(saved));
    }
  }, []);

  // 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState && gameState.startTime && !gameState.isGameOver) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - gameState.startTime!) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState?.startTime, gameState?.isGameOver]);

  // 게임 시작
  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setGameState(initGame(diff));
    setTimer(0);
    setError('');
    setPhase('playing');
  }, []);

  // 기록 저장
  const saveRecord = useCallback(
    (diff: Difficulty, attempts: number) => {
      const current = bestRecords[diff];
      if (!current || attempts < current) {
        const newRecords = {
          ...bestRecords,
          [diff]: attempts,
        };
        setBestRecords(newRecords);
        localStorage.setItem('baseball-best', JSON.stringify(newRecords));
      }
    },
    [bestRecords]
  );

  // 승리 처리
  useEffect(() => {
    if (gameState?.isWon) {
      saveRecord(difficulty, gameState.guesses.length);
    }
  }, [gameState?.isWon, gameState?.guesses.length, difficulty, saveRecord]);

  // 숫자 입력
  const handleDigitInput = (digit: string) => {
    if (!gameState) return;
    setError('');
    setGameState((prev) => (prev ? updateCurrentGuess(prev, digit) : prev));
  };

  // 삭제
  const handleDelete = () => {
    if (!gameState) return;
    setError('');
    setGameState((prev) => (prev ? deleteLastDigit(prev) : prev));
  };

  // 제출
  const handleSubmit = () => {
    if (!gameState) return;

    const validation = isValidGuess(gameState.currentGuess, gameState.digitCount);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError('');
    setGameState((prev) => (prev ? submitGuess(prev, prev.currentGuess) : prev));
  };

  // 키보드 입력
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'playing' || !gameState || gameState.isGameOver) return;

      if (/^[0-9]$/.test(e.key)) {
        handleDigitInput(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleSubmit();
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
          <div className="text-6xl mb-4">⚾</div>
          <h2 className="text-2xl font-bold mb-2">숫자 야구</h2>
          <p className="text-gray-500 dark:text-gray-400">숫자를 추리하여 정답을 맞추세요</p>
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
                        <span className="ml-2 text-blue-500">최소: {best}회</span>
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
          <h3 className="font-semibold mb-2">게임 규칙</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• 중복 없는 숫자를 맞추세요</li>
            <li>
              • <span className="font-bold text-yellow-500">S(스트라이크)</span>: 숫자와 위치 모두
              정확
            </li>
            <li>
              • <span className="font-bold text-blue-500">B(볼)</span>: 숫자는 맞지만 위치가 다름
            </li>
            <li>• 아웃: 해당 숫자가 전혀 없음</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!gameState) return null;

  const config = getDifficultyConfig(difficulty);

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
            <span className="text-gray-500 dark:text-gray-400">시도: </span>
            <span className="font-bold">{gameState.guesses.length}</span>
          </div>
        </div>
        <div className="text-xl font-mono font-bold tabular-nums">{formatTime(timer)}</div>
      </div>

      {/* 현재 입력 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
        <div className="flex justify-center gap-2 mb-3">
          {Array(gameState.digitCount)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className={`w-14 h-14 flex items-center justify-center text-3xl font-bold border-2 rounded-lg ${
                  gameState.currentGuess[i]
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {gameState.currentGuess[i] || ''}
              </div>
            ))}
        </div>

        {/* 에러 메시지 */}
        {error && <div className="text-center text-red-500 text-sm mb-2">{error}</div>}

        {/* 숫자 키패드 */}
        <div className="grid grid-cols-5 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => {
            const isUsed = gameState.currentGuess.includes(digit);
            const isDisabled =
              gameState.isGameOver ||
              (digit === '0' && gameState.currentGuess.length === 0) ||
              isUsed;

            return (
              <button
                key={digit}
                onClick={() => handleDigitInput(digit)}
                disabled={isDisabled}
                className={`h-12 rounded-lg font-bold text-xl transition-colors ${
                  isDisabled
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {digit}
              </button>
            );
          })}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDelete}
            disabled={gameState.isGameOver || gameState.currentGuess.length === 0}
            className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            삭제
          </button>
          <button
            onClick={handleSubmit}
            disabled={gameState.isGameOver || gameState.currentGuess.length !== gameState.digitCount}
            className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            확인
          </button>
        </div>
      </div>

      {/* 추측 기록 */}
      {gameState.guesses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
            추측 기록
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {gameState.guesses
              .slice()
              .reverse()
              .map((result, idx) => {
                const originalIdx = gameState.guesses.length - idx;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">#{originalIdx}</span>
                      <span className="font-mono font-bold text-lg tracking-widest">
                        {result.guess}
                      </span>
                    </div>
                    <span
                      className={`font-bold ${getResultColor(
                        result.strikes,
                        result.balls,
                        gameState.digitCount
                      )}`}
                    >
                      {getHintText(result.strikes, result.balls)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="flex justify-center gap-3">
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
          새 게임
        </button>
      </div>

      {/* 승리 모달 */}
      {gameState.isWon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-xl max-w-sm w-full">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-2xl font-bold mb-2">정답!</h3>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 space-y-2">
              <div className="text-3xl font-mono font-bold tracking-widest text-green-500">
                {gameState.answer}
              </div>
              <div className="flex justify-around mt-3">
                <div>
                  <div className="text-2xl font-bold">{gameState.guesses.length}</div>
                  <div className="text-xs text-gray-500">시도 횟수</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatTime(timer)}</div>
                  <div className="text-xs text-gray-500">소요 시간</div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-500 dark:text-gray-400">점수</div>
                <div className="text-xl font-bold text-blue-500">
                  {ScoreCalculator.baseball(gameState.guesses.length, timer, gameState.digitCount).toLocaleString()}점
                </div>
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
        gameType="baseball"
        difficulty={difficulty}
        score={ScoreCalculator.baseball(gameState?.guesses.length || 20, timer, gameState?.digitCount || 3)}
        timeSeconds={timer}
        metadata={{ attempts: gameState?.guesses.length, digitCount: gameState?.digitCount }}
      />
    </div>
  );
}
