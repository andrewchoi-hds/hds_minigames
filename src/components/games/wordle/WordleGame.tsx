'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  initGame,
  submitGuess,
  updateCurrentGuess,
  deleteLastLetter,
  evaluateGuess,
  isValidWord,
  getLetterColorClass,
  getKeyColorClass,
  LetterState,
} from '@/lib/games/wordle';

type GameMode = 'daily' | 'infinite';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

export default function WordleGame() {
  const [phase, setPhase] = useState<'select' | 'playing'>('select');
  const [mode, setMode] = useState<GameMode>('infinite');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [stats, setStats] = useState({ played: 0, won: 0, streak: 0 });

  // 로컬 스토리지에서 통계 로드
  useEffect(() => {
    const savedStats = localStorage.getItem('wordle-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // 통계 저장
  const saveStats = (newStats: typeof stats) => {
    setStats(newStats);
    localStorage.setItem('wordle-stats', JSON.stringify(newStats));
  };

  // 게임 시작
  const startGame = useCallback((selectedMode: GameMode) => {
    setMode(selectedMode);
    setGameState(initGame(selectedMode));
    setPhase('playing');
    setMessage('');
    setShakeRow(null);
    setRevealRow(null);
  }, []);

  // 메시지 표시
  const showMessage = (msg: string, duration = 1500) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  };

  // 키 입력 처리
  const handleKeyPress = useCallback(
    (key: string) => {
      if (!gameState || gameState.isGameOver) return;

      if (key === 'ENTER') {
        if (gameState.currentGuess.length !== 5) {
          setShakeRow(gameState.guesses.length);
          setTimeout(() => setShakeRow(null), 500);
          showMessage('5글자를 입력하세요');
          return;
        }

        if (!isValidWord(gameState.currentGuess)) {
          setShakeRow(gameState.guesses.length);
          setTimeout(() => setShakeRow(null), 500);
          showMessage('단어 목록에 없습니다');
          return;
        }

        // 결과 표시 애니메이션
        setRevealRow(gameState.guesses.length);

        setTimeout(() => {
          const newState = submitGuess(gameState, gameState.currentGuess);
          setGameState(newState);
          setRevealRow(null);

          if (newState.isWon) {
            const newStats = {
              played: stats.played + 1,
              won: stats.won + 1,
              streak: stats.streak + 1,
            };
            saveStats(newStats);
            showMessage('정답입니다! 🎉', 3000);
          } else if (newState.isGameOver) {
            const newStats = {
              played: stats.played + 1,
              won: stats.won,
              streak: 0,
            };
            saveStats(newStats);
            showMessage(`정답: ${newState.answer.toUpperCase()}`, 5000);
          }
        }, 500);
      } else if (key === '⌫' || key === 'BACKSPACE') {
        setGameState((prev) => (prev ? deleteLastLetter(prev) : prev));
      } else if (/^[A-Z]$/i.test(key)) {
        setGameState((prev) => (prev ? updateCurrentGuess(prev, key) : prev));
      }
    },
    [gameState, stats]
  );

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeyPress('⌫');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleKeyPress]);

  // 모드 선택 화면
  if (phase === 'select') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-2">워들</h2>
          <p className="text-gray-500 dark:text-gray-400">5글자 영단어를 맞춰보세요</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => startGame('daily')}
            className="w-full p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-400 dark:hover:border-green-500 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="flex-1 text-left">
                <div className="font-semibold text-lg group-hover:text-green-500 transition-colors">
                  오늘의 단어
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  매일 새로운 단어 1개
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-green-500 transition-colors">→</div>
            </div>
          </button>

          <button
            onClick={() => startGame('infinite')}
            className="w-full p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div className="flex-1 text-left">
                <div className="font-semibold text-lg group-hover:text-blue-500 transition-colors">
                  무한 모드
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  랜덤 단어로 계속 플레이
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-blue-500 transition-colors">→</div>
            </div>
          </button>
        </div>

        {/* 통계 */}
        {stats.played > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-4">
            <h3 className="text-center font-semibold mb-3">통계</h3>
            <div className="flex justify-around text-center">
              <div>
                <div className="text-2xl font-bold">{stats.played}</div>
                <div className="text-xs text-gray-500">플레이</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                </div>
                <div className="text-xs text-gray-500">승률</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.streak}</div>
                <div className="text-xs text-gray-500">연승</div>
              </div>
            </div>
          </div>
        )}

        {/* 규칙 */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm">
          <h3 className="font-semibold mb-2">게임 방법</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• 6번의 기회 안에 5글자 단어를 맞추세요</li>
            <li>
              • <span className="inline-block w-4 h-4 bg-green-500 rounded align-middle" /> 정확한
              위치
            </li>
            <li>
              • <span className="inline-block w-4 h-4 bg-yellow-500 rounded align-middle" /> 다른
              위치에 존재
            </li>
            <li>
              • <span className="inline-block w-4 h-4 bg-gray-500 rounded align-middle" /> 단어에
              없음
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (!gameState) return null;

  // 그리드 렌더링을 위한 데이터 생성
  const renderGrid = () => {
    const rows = [];

    for (let i = 0; i < gameState.maxGuesses; i++) {
      const guess = gameState.guesses[i];
      const isCurrentRow = i === gameState.guesses.length;
      const isShaking = shakeRow === i;
      const isRevealing = revealRow === i;

      let letters: { char: string; state: LetterState }[] = [];

      if (guess) {
        // 이미 제출된 추측
        const results = evaluateGuess(guess, gameState.answer);
        letters = results.map((r) => ({ char: r.letter.toUpperCase(), state: r.state }));
      } else if (isCurrentRow) {
        // 현재 입력 중인 행
        for (let j = 0; j < 5; j++) {
          letters.push({
            char: gameState.currentGuess[j]?.toUpperCase() || '',
            state: 'empty',
          });
        }
      } else {
        // 빈 행
        letters = Array(5).fill({ char: '', state: 'empty' as LetterState });
      }

      rows.push(
        <div
          key={i}
          className={`flex gap-1.5 justify-center ${isShaking ? 'animate-shake' : ''}`}
        >
          {letters.map((letter, j) => (
            <div
              key={j}
              className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold border-2 rounded transition-all ${
                getLetterColorClass(letter.state)
              } ${letter.char && letter.state === 'empty' ? 'border-gray-400 dark:border-gray-500' : ''} ${
                isRevealing ? `animate-flip delay-${j * 100}` : ''
              }`}
              style={{
                animationDelay: isRevealing ? `${j * 100}ms` : '0ms',
              }}
            >
              {letter.char}
            </div>
          ))}
        </div>
      );
    }

    return rows;
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 상단 */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setPhase('select')}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← 모드 선택
        </button>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${
            mode === 'daily' ? 'bg-green-500' : 'bg-blue-500'
          }`}
        >
          {mode === 'daily' ? '오늘의 단어' : '무한 모드'}
        </span>
      </div>

      {/* 메시지 */}
      {message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold z-50">
          {message}
        </div>
      )}

      {/* 게임 그리드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
        <div className="flex flex-col gap-1.5">{renderGrid()}</div>
      </div>

      {/* 키보드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-3 shadow-sm">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5 mb-1.5">
            {row.map((key) => {
              const isWide = key === 'ENTER' || key === '⌫';
              const letterState = gameState.usedLetters[key.toLowerCase()];

              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`${
                    isWide ? 'px-2 sm:px-4 text-xs' : 'w-8 sm:w-10'
                  } h-12 sm:h-14 rounded font-bold transition-colors ${getKeyColorClass(
                    letterState
                  )}`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 게임 오버 시 버튼 */}
      {gameState.isGameOver && (
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => setPhase('select')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            모드 선택
          </button>
          {mode === 'infinite' && (
            <button
              onClick={() => startGame('infinite')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              다시 하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
