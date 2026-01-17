// 틱택토 게임 로직

export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  isGameOver: boolean;
  winningLine: number[] | null;
}

// 승리 조건 (가로, 세로, 대각선)
const WINNING_LINES = [
  [0, 1, 2], // 가로
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // 세로
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // 대각선
  [2, 4, 6],
];

// 게임 초기화
export function initGame(): GameState {
  return {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    isGameOver: false,
    winningLine: null,
  };
}

// 승리자 확인
export function checkWinner(board: Board): { winner: Player | 'draw' | null; line: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }

  // 무승부 확인
  if (board.every(cell => cell !== null)) {
    return { winner: 'draw', line: null };
  }

  return { winner: null, line: null };
}

// 플레이어 수 두기
export function makeMove(state: GameState, index: number): GameState {
  if (state.board[index] !== null || state.isGameOver) {
    return state;
  }

  const newBoard = [...state.board];
  newBoard[index] = state.currentPlayer;

  const { winner, line } = checkWinner(newBoard);

  return {
    board: newBoard,
    currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
    winner,
    isGameOver: winner !== null,
    winningLine: line,
  };
}

// AI 수 계산 (Minimax 알고리즘)
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number {
  const { winner } = checkWinner(board);

  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (winner === 'draw') return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const evalScore = minimax(board, depth + 1, false, alpha, beta);
        board[i] = null;
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const evalScore = minimax(board, depth + 1, true, alpha, beta);
        board[i] = null;
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
}

// AI 최적 수 찾기
function getBestMove(board: Board): number {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, 0, false, -Infinity, Infinity);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

// 빈 칸 중 랜덤 선택
function getRandomMove(board: Board): number {
  const emptyIndices = board.map((cell, i) => (cell === null ? i : -1)).filter(i => i !== -1);
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

// 의도적으로 나쁜 수 선택 (상대가 이길 수 있는 기회 제공)
function getWeakMove(board: Board): number {
  const emptyIndices = board.map((cell, i) => (cell === null ? i : -1)).filter(i => i !== -1);

  // 코너나 중앙이 아닌 가장자리(약한 위치) 우선 선택
  const weakPositions = [1, 3, 5, 7]; // 가장자리
  const availableWeak = weakPositions.filter(i => board[i] === null);

  if (availableWeak.length > 0 && Math.random() < 0.6) {
    return availableWeak[Math.floor(Math.random() * availableWeak.length)];
  }

  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

// 상대 승리 막기만 하는 수 (공격은 안함)
function getDefensiveMove(board: Board): number {
  // 상대(X)가 이길 수 있는 위치 확인
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'X';
      const { winner } = checkWinner(board);
      board[i] = null;
      if (winner === 'X') {
        return i; // 막아야 함
      }
    }
  }
  // 막을 곳 없으면 랜덤
  return getRandomMove(board);
}

// AI 수 계산 (난이도에 따라)
export function getAIMove(board: Board, difficulty: Difficulty): number {
  const emptyCount = board.filter(c => c === null).length;

  switch (difficulty) {
    case 'easy':
      // 플레이어가 이길 수 있도록 일부러 약하게
      // 자신이 이길 수 있어도 50% 확률로 놓침
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const { winner } = checkWinner(board);
          board[i] = null;
          if (winner === 'O' && Math.random() < 0.5) {
            return i; // 50% 확률로만 승리 수 둠
          }
        }
      }
      // 상대 승리도 30% 확률로만 막음
      if (Math.random() < 0.3) {
        const defensive = getDefensiveMove(board);
        if (defensive !== -1) return defensive;
      }
      // 나머지는 약한 수
      return getWeakMove(board);

    case 'normal':
      // 자신 승리 수는 항상 둠
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const { winner } = checkWinner(board);
          board[i] = null;
          if (winner === 'O') return i;
        }
      }
      // 상대 승리는 80% 확률로 막음
      if (Math.random() < 0.8) {
        for (let i = 0; i < 9; i++) {
          if (board[i] === null) {
            board[i] = 'X';
            const { winner } = checkWinner(board);
            board[i] = null;
            if (winner === 'X') return i;
          }
        }
      }
      // 50% 최적 수, 50% 랜덤
      return Math.random() < 0.5 ? getBestMove(board) : getRandomMove(board);

    case 'hard':
      // 거의 완벽하게 플레이 (무승부 or AI 승리)
      if (emptyCount === 9 || emptyCount === 8) {
        const goodMoves = [0, 2, 4, 6, 8].filter(i => board[i] === null);
        return goodMoves[Math.floor(Math.random() * goodMoves.length)];
      }
      return getBestMove(board);

    default:
      return getBestMove(board);
  }
}

// 점수 계산
export function calculateScore(
  winner: Player | 'draw' | null,
  playerMark: Player,
  difficulty: Difficulty,
  moveCount: number
): number {
  const difficultyMultiplier = { easy: 1, normal: 1.5, hard: 2 };

  if (winner === 'draw') {
    return Math.round(50 * difficultyMultiplier[difficulty]);
  }

  if (winner === playerMark) {
    // 빨리 이길수록 높은 점수
    const speedBonus = Math.max(0, (9 - moveCount) * 10);
    return Math.round((100 + speedBonus) * difficultyMultiplier[difficulty]);
  }

  // 패배
  return 0;
}
