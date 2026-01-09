'use client';

import { Board } from '@/lib/games/sudoku';

type Props = {
  board: Board;
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  errorCells: Set<string>;
};

export default function SudokuBoard({ board, selectedCell, onCellClick, errorCells }: Props) {
  const getCellClass = (row: number, col: number) => {
    const cell = board[row][col];
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isInSameRow = selectedCell?.row === row;
    const isInSameCol = selectedCell?.col === col;
    const isInSameBox =
      selectedCell &&
      Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell.col / 3) === Math.floor(col / 3);
    const isHighlighted = isInSameRow || isInSameCol || isInSameBox;
    const isError = errorCells.has(`${row}-${col}`);

    const classes = [
      'w-full aspect-square flex items-center justify-center text-lg sm:text-xl font-medium cursor-pointer transition-colors',
      'border-gray-300 dark:border-gray-600',
    ];

    // 3x3 박스 테두리
    if (col % 3 === 0) classes.push('border-l-2 border-l-gray-800 dark:border-l-gray-300');
    if (row % 3 === 0) classes.push('border-t-2 border-t-gray-800 dark:border-t-gray-300');
    if (col === 8) classes.push('border-r-2 border-r-gray-800 dark:border-r-gray-300');
    if (row === 8) classes.push('border-b-2 border-b-gray-800 dark:border-b-gray-300');

    // 기본 테두리
    classes.push('border-r border-b');

    // 배경색
    if (isSelected) {
      classes.push('bg-blue-200 dark:bg-blue-700');
    } else if (isError) {
      classes.push('bg-red-200 dark:bg-red-800');
    } else if (isHighlighted) {
      classes.push('bg-blue-50 dark:bg-blue-900/30');
    } else {
      classes.push('bg-white dark:bg-gray-800');
    }

    // 텍스트 색상
    if (cell.isFixed) {
      classes.push('text-gray-800 dark:text-gray-200');
    } else if (cell.value !== 0) {
      classes.push('text-blue-600 dark:text-blue-400');
    }

    return classes.join(' ');
  };

  return (
    <div className="grid grid-cols-9 border-2 border-gray-800 dark:border-gray-300 max-w-md mx-auto">
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => (
          <div
            key={`${rowIdx}-${colIdx}`}
            className={getCellClass(rowIdx, colIdx)}
            onClick={() => onCellClick(rowIdx, colIdx)}
          >
            {cell.value !== 0 ? (
              cell.value
            ) : cell.notes.size > 0 ? (
              <div className="grid grid-cols-3 gap-0 text-[8px] sm:text-[10px] text-gray-500 w-full h-full p-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <span key={n} className="flex items-center justify-center">
                    {cell.notes.has(n) ? n : ''}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
