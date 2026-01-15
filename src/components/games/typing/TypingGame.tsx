'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  Difficulty,
  initGame,
  addWord,
  updateWords,
  handleInput,
  updateTime,
  calculateWPM,
  calculateAccuracy,
  getMatchingWords,
  getDifficultyConfig,
} from '@/lib/games/typing';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

const DIFFICULTY_OPTIONS: { key: Difficulty; color: string; description: string }[] = [
  { key: 'easy', color: 'bg-green-500', description: '짧은 단어, 느린 속도' },
  { key: 'normal', color: 'bg-yellow-500', description: '중간 단어, 보통 속도' },
  { key: 'hard', color: 'bg-red-500', description: '긴 단어, 빠른 속도' },
];

const DURATION_OPTIONS = [30, 60, 120];

export default function TypingGame() {
  const [phase, setPhase] = useState<'select' | 'playing' | 'result'>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [duration, setDuration] = useState(60);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bestWPM, setBestWPM] = useState<Record<Difficulty, number>>({
    easy: 0,
    normal: 0,
    hard: 0,
  });
  const [showScoreModal, setShowScoreModal] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeRef = useRef<number>(0);

  // 로컬 스토리지에서 최고 기록 로드
  useEffect(() => {
    const saved = localStorage.getItem('typing-best-wpm');
    if (saved) {
      setBestWPM(JSON.parse(saved));
    }
  }, []);

  // 게임 시작
  const startGame = useCallback(() => {
    const state = initGame(difficulty, duration);
    setGameState(state);
    setPhase('playing');
    lastTimeRef.current = performance.now();

    // 첫 단어 추가
    setTimeout(() => {
      setGameState((prev) => (prev ? addWord(prev) : prev));
    }, 500);
  }, [difficulty, duration]);

  // 게임 루프
  useEffect(() => {
    if (phase !== 'playing' || !gameState) return;

    const config = getDifficultyConfig(difficulty);

    // 단어 생성 타이머
    spawnTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.isGameOver) return prev;
        // 화면에 단어가 너무 많으면 추가하지 않음
        if (prev.words.length >= 8) return prev;
        return addWord(prev);
      });
    }, config.spawnInterval);

    // 시간 타이머
    timeTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        const updated = updateTime(prev);
        if (updated.isGameOver) {
          setPhase('result');
        }
        return updated;
      });
    }, 1000);

    // 애니메이션 루프
    const gameLoop = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setGameState((prev) => (prev && !prev.isGameOver ? updateWords(prev, deltaTime) : prev));
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    // 입력창 포커스
    inputRef.current?.focus();

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (timeTimerRef.current) clearInterval(timeTimerRef.current);
    };
  }, [phase, difficulty]);

  // 게임 종료 시 기록 저장
  useEffect(() => {
    if (phase === 'result' && gameState) {
      const wpm = calculateWPM(gameState);
      if (wpm > bestWPM[difficulty]) {
        const newBest = { ...bestWPM, [difficulty]: wpm };
        setBestWPM(newBest);
        localStorage.setItem('typing-best-wpm', JSON.stringify(newBest));
      }
    }
  }, [phase, gameState, difficulty, bestWPM]);

  // 입력 처리
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 스페이스로 끝나면 단어 제출 시도
    if (value.endsWith(' ')) {
      const word = value.trim();
      if (word) {
        setGameState((prev) => (prev ? handleInput(prev, word) : prev));
      }
      e.target.value = '';
      return;
    }

    setGameState((prev) =>
      prev
        ? {
            ...prev,
            currentInput: value,
          }
        : prev
    );
  };

  // 엔터로 제출
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value.trim();
      if (value) {
        setGameState((prev) => (prev ? handleInput(prev, value) : prev));
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 난이도 선택 화면
  if (phase === 'select') {
    return (
      <div className="w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⌨️</div>
          <h2 className="text-2xl font-bold mb-2">타이핑 게임</h2>
          <p className="text-gray-500 dark:text-gray-400">떨어지는 단어를 빠르게 타이핑하세요</p>
        </div>

        {/* 난이도 선택 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">난이도</h3>
          <div className="space-y-2">
            {DIFFICULTY_OPTIONS.map(({ key, color, description }) => {
              const config = getDifficultyConfig(key);
              return (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`w-full p-3 bg-white dark:bg-gray-800 border-2 rounded-xl transition-all ${
                    difficulty === key
                      ? 'border-blue-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{config.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
                    </div>
                    {bestWPM[key] > 0 && (
                      <div className="text-xs text-blue-500">최고: {bestWPM[key]} WPM</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 시간 선택 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">게임 시간</h3>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  duration === d
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {formatTime(d)}
              </button>
            ))}
          </div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={startGame}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-colors"
        >
          게임 시작
        </button>

        {/* 게임 방법 */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm">
          <h3 className="font-semibold mb-2">게임 방법</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• 떨어지는 단어를 보고 타이핑</li>
            <li>• 스페이스 또는 엔터로 제출</li>
            <li>• 연속 정답으로 콤보 보너스</li>
            <li>• 단어가 바닥에 닿으면 놓침</li>
          </ul>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (phase === 'result' && gameState) {
    const wpm = calculateWPM(gameState);
    const accuracy = calculateAccuracy(gameState);
    const isNewRecord = wpm > 0 && wpm >= bestWPM[difficulty];

    return (
      <div className="w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg">
          <div className="text-5xl mb-3">{isNewRecord ? '🏆' : '⌨️'}</div>
          <h3 className="text-2xl font-bold mb-4">
            {isNewRecord ? '새 기록!' : '게임 종료'}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-500">{wpm}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">WPM</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-500">{accuracy}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">정확도</div>
            </div>
          </div>

          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">입력한 단어</span>
              <span className="font-bold">{gameState.wordsTyped}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">놓친 단어</span>
              <span className="font-bold">{gameState.wordsMissed}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">최대 콤보</span>
              <span className="font-bold">{gameState.maxCombo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">총 점수</span>
              <span className="font-bold">{gameState.score.toLocaleString()}점</span>
            </div>
          </div>

          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setPhase('select')}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              설정 변경
            </button>
            <button
              onClick={startGame}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              다시 하기
            </button>
          </div>
          <button
            onClick={() => setShowScoreModal(true)}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            랭킹 등록 ({ScoreCalculator.typing(wpm, accuracy, gameState.maxCombo).toLocaleString()}점)
          </button>
        </div>

        {/* 점수 제출 모달 */}
        <ScoreSubmitModal
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          gameType="typing"
          difficulty={difficulty}
          score={ScoreCalculator.typing(wpm, accuracy, gameState.maxCombo)}
          metadata={{ wpm, accuracy, maxCombo: gameState.maxCombo, duration }}
        />
      </div>
    );
  }

  if (!gameState) return null;

  const matchingIds = getMatchingWords(gameState.words, gameState.currentInput);

  return (
    <div className="w-full">
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">점수: </span>
            <span className="font-bold">{gameState.score}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">콤보: </span>
            <span className="font-bold text-orange-500">{gameState.combo}</span>
          </div>
        </div>
        <div
          className={`text-2xl font-mono font-bold tabular-nums ${
            gameState.timeLeft <= 10 ? 'text-red-500' : ''
          }`}
        >
          {formatTime(gameState.timeLeft)}
        </div>
      </div>

      {/* 게임 영역 */}
      <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl h-80 sm:h-96 overflow-hidden mb-4">
        {/* 떨어지는 단어들 */}
        {gameState.words.map((word) => {
          const isMatching = matchingIds.includes(word.id);
          return (
            <div
              key={word.id}
              className={`absolute px-3 py-1.5 rounded-lg font-mono font-bold text-lg transition-colors ${
                isMatching
                  ? 'bg-green-500 text-white scale-110'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-md'
              }`}
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {word.word}
            </div>
          );
        })}

        {/* 바닥선 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500/50" />
      </div>

      {/* 입력 영역 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <input
          ref={inputRef}
          type="text"
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder="단어를 입력하세요..."
          className="w-full px-4 py-3 text-xl font-mono bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
          스페이스 또는 엔터로 제출
        </p>
      </div>
    </div>
  );
}
