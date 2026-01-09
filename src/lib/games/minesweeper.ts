// 지뢰찾기 게임 로직

export type Difficulty = 'easy' | 'normal' | 'hard';

export type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

export type GameState = {
  board: Cell[][];
  rows: number;
  cols: number;
  mines: number;
  flagsUsed: number;
  isGameOver: boolean;
  isWon: boolean;
  isFirstClick: boolean;
  revealedCount: number;
};

// 난이도별 설정
const DIFFICULTY_CONFIG: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  easy: { rows: 8, cols: 8, mines: 10 },
  normal: { rows: 12, cols: 12, mines: 30 },
  hard: { rows: 16, cols: 16, mines: 60 },
};

export function getDifficultyConfig(difficulty: Difficulty) {
  return DIFFICULTY_CONFIG[difficulty];
}

// 빈 보드 생성
function createEmptyBoard(rows: number, cols: number): Cell[][] {
  return Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );
}

// 지뢰 배치 (첫 클릭 위치 제외)
function placeMines(
  board: Cell[][],
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number
): Cell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let placed = 0;

  // 안전 지역 (첫 클릭 주변 3x3)
  const safeZone = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      safeZone.add(`${safeRow + dr}-${safeCol + dc}`);
    }
  }

  while (placed < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);

    if (!newBoard[row][col].isMine && !safeZone.has(`${row}-${col}`)) {
      newBoard[row][col].isMine = true;
      placed++;
    }
  }

  // 인접 지뢰 수 계산
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].adjacentMines = countAdjacentMines(newBoard, row, col, rows, cols);
      }
    }
  }

  return newBoard;
}

// 인접 지뢰 수 계산
function countAdjacentMines(
  board: Cell[][],
  row: number,
  col: number,
  rows: number,
  cols: number
): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
        count++;
      }
    }
  }
  return count;
}

// 게임 초기화
export function initGame(difficulty: Difficulty): GameState {
  const { rows, cols, mines } = DIFFICULTY_CONFIG[difficulty];
  const board = createEmptyBoard(rows, cols);

  return {
    board,
    rows,
    cols,
    mines,
    flagsUsed: 0,
    isGameOver: false,
    isWon: false,
    isFirstClick: true,
    revealedCount: 0,
  };
}

// 셀 열기
export function revealCell(state: GameState, row: number, col: number): GameState {
  if (state.isGameOver || state.isWon) return state;

  const cell = state.board[row][col];
  if (cell.isRevealed || cell.isFlagged) return state;

  let newBoard = state.board.map(r => r.map(c => ({ ...c })));
  let isFirstClick = state.isFirstClick;

  // 첫 클릭이면 지뢰 배치
  if (isFirstClick) {
    newBoard = placeMines(newBoard, state.rows, state.cols, state.mines, row, col);
    isFirstClick = false;
  }

  // 지뢰 클릭
  if (newBoard[row][col].isMine) {
    // 모든 지뢰 공개
    newBoard = newBoard.map(r =>
      r.map(c => (c.isMine ? { ...c, isRevealed: true } : c))
    );
    return {
      ...state,
      board: newBoard,
      isGameOver: true,
      isFirstClick,
    };
  }

  // 빈 셀 연쇄 열기
  let revealedCount = state.revealedCount;
  const toReveal: [number, number][] = [[row, col]];
  const visited = new Set<string>();

  while (toReveal.length > 0) {
    const [r, c] = toReveal.pop()!;
    const key = `${r}-${c}`;

    if (visited.has(key)) continue;
    visited.add(key);

    if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) continue;
    if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged || newBoard[r][c].isMine) continue;

    newBoard[r][c].isRevealed = true;
    revealedCount++;

    // 인접 지뢰가 없으면 주변 셀도 열기
    if (newBoard[r][c].adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            toReveal.push([r + dr, c + dc]);
          }
        }
      }
    }
  }

  // 승리 확인
  const totalSafeCells = state.rows * state.cols - state.mines;
  const isWon = revealedCount === totalSafeCells;

  return {
    ...state,
    board: newBoard,
    isFirstClick,
    revealedCount,
    isWon,
  };
}

// 깃발 토글
export function toggleFlag(state: GameState, row: number, col: number): GameState {
  if (state.isGameOver || state.isWon) return state;

  const cell = state.board[row][col];
  if (cell.isRevealed) return state;

  // 깃발 제거
  if (cell.isFlagged) {
    const newBoard = state.board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].isFlagged = false;
    return {
      ...state,
      board: newBoard,
      flagsUsed: state.flagsUsed - 1,
    };
  }

  // 깃발 추가 (지뢰 수 제한)
  if (state.flagsUsed >= state.mines) return state;

  const newBoard = state.board.map(r => r.map(c => ({ ...c })));
  newBoard[row][col].isFlagged = true;

  return {
    ...state,
    board: newBoard,
    flagsUsed: state.flagsUsed + 1,
  };
}

// 주변 셀 한번에 열기 (숫자 셀 클릭 시)
export function revealAdjacent(state: GameState, row: number, col: number): GameState {
  if (state.isGameOver || state.isWon) return state;

  const cell = state.board[row][col];
  if (!cell.isRevealed || cell.adjacentMines === 0) return state;

  // 주변 깃발 수 확인
  let flagCount = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
        if (state.board[nr][nc].isFlagged) flagCount++;
      }
    }
  }

  // 깃발 수가 인접 지뢰 수와 같으면 주변 열기
  if (flagCount !== cell.adjacentMines) return state;

  let newState = state;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
        if (!state.board[nr][nc].isFlagged && !state.board[nr][nc].isRevealed) {
          newState = revealCell(newState, nr, nc);
          if (newState.isGameOver) return newState;
        }
      }
    }
  }

  return newState;
}

// 숫자 색상
export function getNumberColor(num: number): string {
  const colors: Record<number, string> = {
    1: 'text-blue-600',
    2: 'text-green-600',
    3: 'text-red-600',
    4: 'text-purple-700',
    5: 'text-amber-700',
    6: 'text-cyan-600',
    7: 'text-gray-800',
    8: 'text-gray-600',
  };
  return colors[num] || 'text-gray-800';
}
