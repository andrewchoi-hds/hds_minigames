// 슬라이딩 퍼즐 게임 로직

export type Difficulty = '3x3' | '4x4' | '5x5';

export type GameState = {
  board: number[]; // 0은 빈 칸
  size: number;
  moves: number;
  isWon: boolean;
  startTime: number | null;
};

// 난이도별 설정
const DIFFICULTY_CONFIG: Record<Difficulty, { size: number; label: string; description: string }> = {
  '3x3': { size: 3, label: '쉬움', description: '3×3 (8 퍼즐)' },
  '4x4': { size: 4, label: '보통', description: '4×4 (15 퍼즐)' },
  '5x5': { size: 5, label: '어려움', description: '5×5 (24 퍼즐)' },
};

export function getDifficultyConfig(difficulty: Difficulty) {
  return DIFFICULTY_CONFIG[difficulty];
}

// 목표 상태 (정렬된 상태)
export function getGoalState(size: number): number[] {
  const goal: number[] = [];
  for (let i = 1; i < size * size; i++) {
    goal.push(i);
  }
  goal.push(0); // 빈 칸은 마지막
  return goal;
}

// 풀이 가능 여부 확인
function isSolvable(board: number[], size: number): boolean {
  let inversions = 0;
  const flatBoard = board.filter(n => n !== 0);

  for (let i = 0; i < flatBoard.length; i++) {
    for (let j = i + 1; j < flatBoard.length; j++) {
      if (flatBoard[i] > flatBoard[j]) {
        inversions++;
      }
    }
  }

  // 홀수 크기: inversions가 짝수면 풀이 가능
  if (size % 2 === 1) {
    return inversions % 2 === 0;
  }

  // 짝수 크기: 빈 칸 행 (아래에서부터) + inversions가 홀수면 풀이 가능
  const emptyIndex = board.indexOf(0);
  const emptyRowFromBottom = size - Math.floor(emptyIndex / size);
  return (emptyRowFromBottom + inversions) % 2 === 1;
}

// 보드 섞기
function shuffleBoard(size: number): number[] {
  const goal = getGoalState(size);
  let board: number[];

  do {
    board = [...goal];
    // Fisher-Yates 셔플
    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
  } while (!isSolvable(board, size) || arraysEqual(board, goal));

  return board;
}

// 배열 비교
function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((val, idx) => val === b[idx]);
}

// 게임 초기화
export function initGame(difficulty: Difficulty): GameState {
  const { size } = DIFFICULTY_CONFIG[difficulty];
  const board = shuffleBoard(size);

  return {
    board,
    size,
    moves: 0,
    isWon: false,
    startTime: null,
  };
}

// 빈 칸 위치
export function getEmptyIndex(board: number[]): number {
  return board.indexOf(0);
}

// 이동 가능한 타일 인덱스들
export function getMovableTiles(board: number[], size: number): number[] {
  const emptyIdx = getEmptyIndex(board);
  const emptyRow = Math.floor(emptyIdx / size);
  const emptyCol = emptyIdx % size;
  const movable: number[] = [];

  // 상
  if (emptyRow > 0) movable.push(emptyIdx - size);
  // 하
  if (emptyRow < size - 1) movable.push(emptyIdx + size);
  // 좌
  if (emptyCol > 0) movable.push(emptyIdx - 1);
  // 우
  if (emptyCol < size - 1) movable.push(emptyIdx + 1);

  return movable;
}

// 타일 이동
export function moveTile(state: GameState, tileIndex: number): GameState {
  if (state.isWon) return state;

  const movable = getMovableTiles(state.board, state.size);
  if (!movable.includes(tileIndex)) return state;

  const emptyIdx = getEmptyIndex(state.board);
  const newBoard = [...state.board];
  [newBoard[emptyIdx], newBoard[tileIndex]] = [newBoard[tileIndex], newBoard[emptyIdx]];

  const goal = getGoalState(state.size);
  const isWon = arraysEqual(newBoard, goal);

  return {
    ...state,
    board: newBoard,
    moves: state.moves + 1,
    isWon,
    startTime: state.startTime ?? Date.now(),
  };
}

// 키보드 방향으로 이동 (빈 칸 기준)
export function moveByDirection(
  state: GameState,
  direction: 'up' | 'down' | 'left' | 'right'
): GameState {
  if (state.isWon) return state;

  const emptyIdx = getEmptyIndex(state.board);
  const emptyRow = Math.floor(emptyIdx / state.size);
  const emptyCol = emptyIdx % state.size;
  let tileIdx = -1;

  // 방향키는 "빈 칸이 이동하는 방향"
  // 예: 위쪽 키 = 빈 칸이 위로 = 위에 있는 타일이 아래로
  switch (direction) {
    case 'up':
      if (emptyRow > 0) tileIdx = emptyIdx - state.size;
      break;
    case 'down':
      if (emptyRow < state.size - 1) tileIdx = emptyIdx + state.size;
      break;
    case 'left':
      if (emptyCol > 0) tileIdx = emptyIdx - 1;
      break;
    case 'right':
      if (emptyCol < state.size - 1) tileIdx = emptyIdx + 1;
      break;
  }

  if (tileIdx === -1) return state;
  return moveTile(state, tileIdx);
}

// 최적 이동 횟수 (휴리스틱, 참고용)
export function getManhattanDistance(board: number[], size: number): number {
  let distance = 0;
  for (let i = 0; i < board.length; i++) {
    const value = board[i];
    if (value === 0) continue;

    const targetRow = Math.floor((value - 1) / size);
    const targetCol = (value - 1) % size;
    const currentRow = Math.floor(i / size);
    const currentCol = i % size;

    distance += Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);
  }
  return distance;
}

// 타일 색상 (값에 따라)
export function getTileColor(value: number, size: number): string {
  if (value === 0) return 'bg-transparent';

  // 그라데이션 색상
  const total = size * size - 1;
  const ratio = (value - 1) / total;

  if (ratio < 0.25) return 'bg-blue-500 text-white';
  if (ratio < 0.5) return 'bg-green-500 text-white';
  if (ratio < 0.75) return 'bg-yellow-500 text-white';
  return 'bg-red-500 text-white';
}
