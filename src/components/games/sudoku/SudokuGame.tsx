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

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  normal: 'Normal',
  hard: 'Hard',
  expert: 'Expert',
  master: 'Master',
  extreme: 'Extreme',
};

const HINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  normal: 5,
  hard: 4,
  expert: 3,
  master: 2,
  extreme: 1,
};

export default function SudokuGame() {
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
  }, []);

  // 초기 게임 시작
  useEffect(() => {
    startNewGame('normal');
  }, [startNewGame]);

  // 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isComplete) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isComplete]);

  // 키보드 입력
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || !board || isComplete) return;

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
  }, [selectedCell, board, isComplete, isNoteMode]);

  // 숫자 입력
  const handleNumberInput = (num: number) => {
    if (!selectedCell || !board) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isFixed) return;

    // 히스토리 저장
    setHistory(prev => [...prev, copyBoard(board)]);

    const newBoard = copyBoard(board);

    if (isNoteMode) {
      // 메모 모드
      const notes = new Set(newBoard[row][col].notes);
      if (notes.has(num)) {
        notes.delete(num);
      } else {
        notes.add(num);
      }
      newBoard[row][col].notes = notes;
      newBoard[row][col].value = 0;
    } else {
      // 일반 모드
      newBoard[row][col].value = num;
      newBoard[row][col].notes = new Set();

      // 오류 확인
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

      // 완성 확인
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

    // 오류 재확인
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

    // 오류 재확인
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
    setSelectedCell({ row: hint.row, col: hint.col });

    // 완성 확인
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

  if (!board) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">게임 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 상단 정보 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
            {DIFFICULTY_LABELS[difficulty]}
          </span>
        </div>
        <div className="text-xl font-mono font-bold">{formatTime(timer)}</div>
      </div>

      {/* 게임 보드 */}
      <SudokuBoard
        board={board}
        selectedCell={selectedCell}
        onCellClick={(row, col) => setSelectedCell({ row, col })}
        errorCells={errorCells}
      />

      {/* 숫자 패드 */}
      <NumberPad
        onNumberClick={handleNumberInput}
        onClear={handleClear}
        onUndo={handleUndo}
        isNoteMode={isNoteMode}
        onNoteModeToggle={() => setIsNoteMode(prev => !prev)}
        onHint={handleHint}
        hintsRemaining={hintsRemaining}
      />

      {/* 난이도 선택 */}
      <div className="mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">새 게임</p>
        <div className="flex flex-wrap justify-center gap-2">
          {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => startNewGame(diff)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                difficulty === diff
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {DIFFICULTY_LABELS[diff]}
            </button>
          ))}
        </div>
      </div>

      {/* 완성 모달 */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mx-4 max-w-sm w-full text-center shadow-xl">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">축하합니다!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {DIFFICULTY_LABELS[difficulty]} 난이도를 {formatTime(timer)}에 클리어했습니다!
            </p>
            <button
              onClick={() => startNewGame(difficulty)}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              다시 플레이
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
