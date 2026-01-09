'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Board,
  Difficulty,
  generatePuzzle,
  copyBoard,
  isValidPlacement,
  isBoardComplete,
  solvePuzzle,
  getHint,
} from '@/lib/games/sudoku';
import SudokuBoard from './SudokuBoard';
import NumberPad from './NumberPad';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; description: string }> = {
  normal: { label: 'Normal', color: 'bg-green-500', description: '입문자를 위한 난이도' },
  hard: { label: 'Hard', color: 'bg-yellow-500', description: '중급자 도전' },
  expert: { label: 'Expert', color: 'bg-orange-500', description: '고급 테크닉 필요' },
  master: { label: 'Master', color: 'bg-red-500', description: 'X-Wing, Swordfish 필요' },
  extreme: { label: 'Extreme', color: 'bg-purple-600', description: '극한의 도전' },
};

const HINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  normal: 5,
  hard: 4,
  expert: 3,
  master: 2,
  extreme: 1,
};

type GameState = 'select' | 'playing';

export default function SudokuGame() {
  const [gameState, setGameState] = useState<GameState>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [board, setBoard] = useState<Board | null>(null);
  const [solution, setSolution] = useState<Board | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [history, setHistory] = useState<Board[]>([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(HINTS_BY_DIFFICULTY.normal);
  const [isComplete, setIsComplete] = useState(false);
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState<Difficulty | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  // 새 게임 시작
  const startNewGame = useCallback((diff: Difficulty) => {
    const newBoard = generatePuzzle(diff);
    const solved = solvePuzzle(newBoard);
    setBoard(newBoard);
    setSolution(solved);
    setSelectedCell(null);
    setIsNoteMode(false);
    setHistory([]);
    setTimer(0);
    setIsRunning(true);
    setHintsRemaining(HINTS_BY_DIFFICULTY[diff]);
    setIsComplete(false);
    setErrorCells(new Set());
    setDifficulty(diff);
    setGameState('playing');
    setShowSettings(false);
    setShowNewGameConfirm(null);
    setIsPaused(false);
    setHintsUsed(0);
  }, []);

  // 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isComplete && !isPaused && gameState === 'playing') {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isComplete, isPaused, gameState]);

  // 키보드 입력
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || !selectedCell || !board || isComplete || isPaused) return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        handleNumberInput(num);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClear();
      } else if (e.key === 'n' || e.key === 'N') {
        setIsNoteMode(prev => !prev);
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, board, isComplete, isNoteMode, gameState, isPaused]);

  // 숫자 입력
  const handleNumberInput = (num: number) => {
    if (!selectedCell || !board) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isFixed) return;

    setHistory(prev => [...prev, copyBoard(board)]);

    const newBoard = copyBoard(board);

    if (isNoteMode) {
      const notes = new Set(newBoard[row][col].notes);
      if (notes.has(num)) {
        notes.delete(num);
      } else {
        notes.add(num);
      }
      newBoard[row][col].notes = notes;
      newBoard[row][col].value = 0;
    } else {
      newBoard[row][col].value = num;
      newBoard[row][col].notes = new Set();

      const newErrors = new Set<string>();
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const v = newBoard[r][c].value;
          if (v !== 0 && !isValidPlacement(newBoard, r, c, v)) {
            newErrors.add(`${r}-${c}`);
          }
        }
      }
      setErrorCells(newErrors);

      if (newErrors.size === 0 && isBoardComplete(newBoard)) {
        setIsComplete(true);
        setIsRunning(false);
      }
    }

    setBoard(newBoard);
  };

  // 지우기
  const handleClear = () => {
    if (!selectedCell || !board) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isFixed) return;

    setHistory(prev => [...prev, copyBoard(board)]);

    const newBoard = copyBoard(board);
    newBoard[row][col].value = 0;
    newBoard[row][col].notes = new Set();
    setBoard(newBoard);

    const newErrors = new Set<string>();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = newBoard[r][c].value;
        if (v !== 0 && !isValidPlacement(newBoard, r, c, v)) {
          newErrors.add(`${r}-${c}`);
        }
      }
    }
    setErrorCells(newErrors);
  };

  // 실행취소
  const handleUndo = () => {
    if (history.length === 0) return;
    const prevBoard = history[history.length - 1];
    setBoard(prevBoard);
    setHistory(prev => prev.slice(0, -1));
    setIsComplete(false);
    setIsRunning(true);

    const newErrors = new Set<string>();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = prevBoard[r][c].value;
        if (v !== 0 && !isValidPlacement(prevBoard, r, c, v)) {
          newErrors.add(`${r}-${c}`);
        }
      }
    }
    setErrorCells(newErrors);
  };

  // 힌트
  const handleHint = () => {
    if (!board || !solution || hintsRemaining === 0) return;

    const hint = getHint(board, solution);
    if (!hint) return;

    setHistory(prev => [...prev, copyBoard(board)]);

    const newBoard = copyBoard(board);
    newBoard[hint.row][hint.col].value = hint.value;
    newBoard[hint.row][hint.col].notes = new Set();
    setBoard(newBoard);
    setHintsRemaining(prev => prev - 1);
    setHintsUsed(prev => prev + 1);
    setSelectedCell({ row: hint.row, col: hint.col });

    if (isBoardComplete(newBoard)) {
      setIsComplete(true);
      setIsRunning(false);
    }
  };

  // 타이머 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 난이도 선택 화면
  if (gameState === 'select') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔢</div>
          <h2 className="text-2xl font-bold mb-2">스도쿠</h2>
          <p className="text-gray-500 dark:text-gray-400">난이도를 선택하세요</p>
        </div>

        <div className="space-y-3">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => startNewGame(diff)}
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

  // 게임 로딩 중
  if (!board) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <div className="text-gray-500">퍼즐 생성 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${DIFFICULTY_CONFIG[difficulty].color}`}>
            {DIFFICULTY_CONFIG[difficulty].label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xl font-mono font-bold tabular-nums">
            {formatTime(timer)}
          </div>
          <button
            onClick={() => {
              setShowSettings(true);
              setIsPaused(true);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="설정"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 게임 보드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm mb-4">
        <SudokuBoard
          board={board}
          selectedCell={selectedCell}
          onCellClick={(row, col) => setSelectedCell({ row, col })}
          errorCells={errorCells}
        />
      </div>

      {/* 숫자 패드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <NumberPad
          onNumberClick={handleNumberInput}
          onClear={handleClear}
          onUndo={handleUndo}
          isNoteMode={isNoteMode}
          onNoteModeToggle={() => setIsNoteMode(prev => !prev)}
          onHint={handleHint}
          hintsRemaining={hintsRemaining}
        />
      </div>

      {/* 설정 모달 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold">설정</h3>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setIsPaused(false);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">새 게임 시작</div>
              {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => setShowNewGameConfirm(diff)}
                  className="w-full p-3 flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${DIFFICULTY_CONFIG[diff].color}`} />
                  <span className="font-medium">{DIFFICULTY_CONFIG[diff].label}</span>
                  {difficulty === diff && (
                    <span className="ml-auto text-xs text-blue-500 font-medium">현재</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowSettings(false);
                  setIsPaused(false);
                }}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                게임으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 새 게임 확인 모달 */}
      {showNewGameConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">새 게임을 시작할까요?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              현재 진행 중인 게임이 사라집니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewGameConfirm(null)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => startNewGame(showNewGameConfirm)}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 완성 모달 */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">축하합니다!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              <span className={`inline-block px-2 py-0.5 rounded text-white text-sm font-medium ${DIFFICULTY_CONFIG[difficulty].color}`}>
                {DIFFICULTY_CONFIG[difficulty].label}
              </span>
              {' '}난이도 클리어!
            </p>
            <p className="text-3xl font-mono font-bold mb-2">{formatTime(timer)}</p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">점수</div>
              <div className="text-2xl font-bold text-blue-500">
                {ScoreCalculator.sudoku(difficulty, timer, hintsUsed).toLocaleString()}점
              </div>
            </div>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setGameState('select')}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                난이도 선택
              </button>
              <button
                onClick={() => startNewGame(difficulty)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                다시 플레이
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
        gameType="sudoku"
        difficulty={difficulty}
        score={ScoreCalculator.sudoku(difficulty, timer, hintsUsed)}
        timeSeconds={timer}
        metadata={{ hintsUsed }}
      />
    </div>
  );
}
