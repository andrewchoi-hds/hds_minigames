// 스도쿠 게임 로직

export type Difficulty = 'normal' | 'hard' | 'expert' | 'master' | 'extreme';

export type Cell = {
  value: number; // 0 = empty, 1-9 = filled
  isFixed: boolean; // 초기 주어진 숫자인지
  isLocked: boolean; // 정답을 맞춰서 잠긴 셀인지
  notes: Set<number>; // 메모 (1-9)
};

export type Board = Cell[][];

// 난이도별 빈 칸 개수
const DIFFICULTY_BLANKS: Record<Difficulty, [number, number]> = {
  normal: [35, 40],
  hard: [45, 50],
  expert: [50, 55],
  master: [55, 58],
  extreme: [58, 64],
};

// 난이도별 실패 허용 횟수
export const MISTAKES_LIMIT: Record<Difficulty, number> = {
  normal: 5,
  hard: 4,
  expert: 3,
  master: 2,
  extreme: 1,
};

// 빈 보드 생성
export function createEmptyBoard(): Board {
  return Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => ({
      value: 0,
      isFixed: false,
      isLocked: false,
      notes: new Set<number>(),
    }))
  );
}

// 각 숫자별 사용 횟수 계산
export function getNumberCounts(board: Board): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c].value;
      if (val >= 1 && val <= 9) {
        counts[val]++;
      }
    }
  }
  return counts;
}

// 완료된 숫자 목록 (9개 모두 사용된 숫자)
export function getCompletedNumbers(board: Board): Set<number> {
  const counts = getNumberCounts(board);
  const completed = new Set<number>();
  for (let num = 1; num <= 9; num++) {
    if (counts[num] >= 9) {
      completed.add(num);
    }
  }
  return completed;
}

// 특정 위치에 숫자가 유효한지 확인
export function isValidPlacement(board: Board, row: number, col: number, num: number): boolean {
  // 같은 행 확인
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c].value === num) return false;
  }

  // 같은 열 확인
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col].value === num) return false;
  }

  // 3x3 박스 확인
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row && c !== col && board[r][c].value === num) return false;
    }
  }

  return true;
}

// 완성된 보드 생성 (백트래킹)
function generateSolvedBoard(): number[][] {
  const board: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

  function solve(pos: number): boolean {
    if (pos === 81) return true;

    const row = Math.floor(pos / 9);
    const col = pos % 9;

    // 숫자 1-9를 섞어서 시도
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of nums) {
      if (isValidNum(board, row, col, num)) {
        board[row][col] = num;
        if (solve(pos + 1)) return true;
        board[row][col] = 0;
      }
    }

    return false;
  }

  solve(0);
  return board;
}

// 숫자 배열 섞기
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 단순 숫자 배열용 유효성 검사
function isValidNum(board: number[][], row: number, col: number, num: number): boolean {
  // 행 확인
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }

  // 열 확인
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }

  // 3x3 박스 확인
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

// 유일해가 있는지 확인
function hasUniqueSolution(board: number[][]): boolean {
  let solutions = 0;

  function solve(pos: number): boolean {
    if (solutions > 1) return true; // 2개 이상이면 중단
    if (pos === 81) {
      solutions++;
      return solutions > 1;
    }

    const row = Math.floor(pos / 9);
    const col = pos % 9;

    if (board[row][col] !== 0) {
      return solve(pos + 1);
    }

    for (let num = 1; num <= 9; num++) {
      if (isValidNum(board, row, col, num)) {
        board[row][col] = num;
        if (solve(pos + 1)) {
          board[row][col] = 0;
          return true;
        }
        board[row][col] = 0;
      }
    }

    return false;
  }

  solve(0);
  return solutions === 1;
}

// 퍼즐 생성
export function generatePuzzle(difficulty: Difficulty): Board {
  const solvedBoard = generateSolvedBoard();
  const [minBlanks, maxBlanks] = DIFFICULTY_BLANKS[difficulty];
  const targetBlanks = minBlanks + Math.floor(Math.random() * (maxBlanks - minBlanks + 1));

  // 숫자 제거 위치 섞기
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => i)
  );

  const puzzleBoard: number[][] = solvedBoard.map(row => [...row]);
  let blanks = 0;

  for (const pos of positions) {
    if (blanks >= targetBlanks) break;

    const row = Math.floor(pos / 9);
    const col = pos % 9;
    const backup = puzzleBoard[row][col];

    puzzleBoard[row][col] = 0;

    // 유일해 검증 (성능 위해 일부만 검증)
    if (blanks < 45 || hasUniqueSolution(puzzleBoard.map(r => [...r]))) {
      blanks++;
    } else {
      puzzleBoard[row][col] = backup;
    }
  }

  // Board 형태로 변환
  return puzzleBoard.map(row =>
    row.map(value => ({
      value,
      isFixed: value !== 0,
      isLocked: value !== 0, // 초기 숫자도 잠김 상태
      notes: new Set<number>(),
    }))
  );
}

// 보드가 완성되었는지 확인
export function isBoardComplete(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = board[row][col];
      if (cell.value === 0) return false;
      if (!isValidPlacement(board, row, col, cell.value)) return false;
    }
  }
  return true;
}

// 보드 복사
export function copyBoard(board: Board): Board {
  return board.map(row =>
    row.map(cell => ({
      value: cell.value,
      isFixed: cell.isFixed,
      isLocked: cell.isLocked,
      notes: new Set(cell.notes),
    }))
  );
}

// 힌트: 빈 칸 하나에 정답 채우기
export function getHint(board: Board, solution: Board): { row: number; col: number; value: number } | null {
  const emptyCells: { row: number; col: number }[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value === 0) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length === 0) return null;

  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  return { row, col, value: solution[row][col].value };
}

// 정답 보드 생성 (퍼즐에서 정답 추출용)
export function solvePuzzle(board: Board): Board | null {
  const numBoard: number[][] = board.map(row => row.map(cell => cell.value));

  function solve(pos: number): boolean {
    if (pos === 81) return true;

    const row = Math.floor(pos / 9);
    const col = pos % 9;

    if (numBoard[row][col] !== 0) {
      return solve(pos + 1);
    }

    for (let num = 1; num <= 9; num++) {
      if (isValidNum(numBoard, row, col, num)) {
        numBoard[row][col] = num;
        if (solve(pos + 1)) return true;
        numBoard[row][col] = 0;
      }
    }

    return false;
  }

  if (!solve(0)) return null;

  return numBoard.map(row =>
    row.map(value => ({
      value,
      isFixed: true,
      isLocked: true,
      notes: new Set<number>(),
    }))
  );
}
