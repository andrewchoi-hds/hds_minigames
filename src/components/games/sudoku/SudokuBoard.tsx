'use client';

import { Board } from '@/lib/games/sudoku';

type Props = {
  board: Board;
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  errorCells: Set<string>;
};

export default function SudokuBoard({ board, selectedCell, onCellClick, errorCells }: Props) {
  // 선택된 셀과 같은 숫자 하이라이트
  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col].value : 0;

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
    const isSameValue = selectedValue !== 0 && cell.value === selectedValue;

    const classes = [
      'w-full aspect-square flex items-center justify-center cursor-pointer transition-all duration-100',
      'text-lg sm:text-xl md:text-2xl font-semibold',
    ];

    // 배경색 (우선순위: 선택 > 에러 > 같은숫자 > 하이라이트 > 기본)
    if (isSelected) {
      classes.push('bg-blue-400 dark:bg-blue-600 text-white');
    } else if (isError) {
      classes.push('bg-red-100 dark:bg-red-900/50');
    } else if (isSameValue) {
      classes.push('bg-blue-100 dark:bg-blue-800/40');
    } else if (isHighlighted) {
      classes.push('bg-gray-100 dark:bg-gray-700/50');
    } else {
      classes.push('bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30');
    }

    // 텍스트 색상
    if (!isSelected) {
      if (isError) {
        classes.push('text-red-600 dark:text-red-400');
      } else if (cell.isFixed) {
        classes.push('text-gray-800 dark:text-gray-100');
      } else if (cell.value !== 0) {
        classes.push('text-blue-600 dark:text-blue-400');
      }
    }

    return classes.join(' ');
  };

  // 3x3 박스 렌더링
  const renderBox = (boxRow: number, boxCol: number) => {
    const cells = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const row = boxRow * 3 + r;
        const col = boxCol * 3 + c;
        const cell = board[row][col];
        cells.push(
          <div
            key={`${row}-${col}`}
            className={getCellClass(row, col)}
            onClick={() => onCellClick(row, col)}
          >
            {cell.value !== 0 ? (
              <span className="select-none">{cell.value}</span>
            ) : cell.notes.size > 0 ? (
              <div className="grid grid-cols-3 w-full h-full p-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <span
                    key={n}
                    className="flex items-center justify-center text-[7px] sm:text-[9px] text-gray-400 dark:text-gray-500 font-normal select-none"
                  >
                    {cell.notes.has(n) ? n : ''}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-1.5 max-w-md mx-auto">
      {[0, 1, 2].map(boxRow =>
        [0, 1, 2].map(boxCol => (
          <div
            key={`box-${boxRow}-${boxCol}`}
            className="grid grid-cols-3 gap-px bg-gray-300 dark:bg-gray-600 rounded-lg overflow-hidden shadow-sm"
          >
            {renderBox(boxRow, boxCol)}
          </div>
        ))
      )}
    </div>
  );
}
