// 뱀 게임 로직

export type Direction = 'up' | 'down' | 'left' | 'right';

export type Position = {
  x: number;
  y: number;
};

export type GameState = {
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  speed: number;
  gridSize: number;
};

// 게임 상수
const INITIAL_SPEED = 150; // ms per move
const SPEED_INCREASE = 5; // 점수 올라갈 때마다 속도 증가 (ms 감소)
const MIN_SPEED = 50; // 최소 속도 (최대 빠르기)
const DEFAULT_GRID_SIZE = 15;

// 초기화
export function initGame(gridSize: number = DEFAULT_GRID_SIZE): GameState {
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);

  return {
    isPlaying: false,
    isGameOver: false,
    score: 0,
    snake: [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ],
    food: generateFood(
      [
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY },
      ],
      gridSize
    ),
    direction: 'right',
    nextDirection: 'right',
    speed: INITIAL_SPEED,
    gridSize,
  };
}

// 음식 생성
function generateFood(snake: Position[], gridSize: number): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
  return food;
}

// 게임 시작
export function startGame(state: GameState): GameState {
  return {
    ...state,
    isPlaying: true,
    isGameOver: false,
  };
}

// 방향 변경
export function changeDirection(state: GameState, newDirection: Direction): GameState {
  // 반대 방향으로 이동 불가
  const opposites: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };

  if (opposites[state.direction] === newDirection) {
    return state;
  }

  return {
    ...state,
    nextDirection: newDirection,
  };
}

// 게임 업데이트 (한 프레임)
export function updateGame(state: GameState): GameState {
  if (!state.isPlaying || state.isGameOver) return state;

  const direction = state.nextDirection;
  const head = state.snake[0];

  // 새 머리 위치 계산
  let newHead: Position;
  switch (direction) {
    case 'up':
      newHead = { x: head.x, y: head.y - 1 };
      break;
    case 'down':
      newHead = { x: head.x, y: head.y + 1 };
      break;
    case 'left':
      newHead = { x: head.x - 1, y: head.y };
      break;
    case 'right':
      newHead = { x: head.x + 1, y: head.y };
      break;
  }

  // 벽 충돌 확인
  if (
    newHead.x < 0 ||
    newHead.x >= state.gridSize ||
    newHead.y < 0 ||
    newHead.y >= state.gridSize
  ) {
    return {
      ...state,
      isGameOver: true,
    };
  }

  // 자기 몸 충돌 확인
  if (state.snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
    return {
      ...state,
      isGameOver: true,
    };
  }

  // 음식 먹었는지 확인
  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;

  // 새 뱀 위치
  const newSnake = [newHead, ...state.snake];
  if (!ateFood) {
    newSnake.pop(); // 음식을 안 먹었으면 꼬리 제거
  }

  // 점수 및 속도 업데이트
  const newScore = ateFood ? state.score + 1 : state.score;
  const newSpeed = ateFood
    ? Math.max(MIN_SPEED, state.speed - SPEED_INCREASE)
    : state.speed;

  // 새 음식 생성 (먹었을 경우)
  const newFood = ateFood ? generateFood(newSnake, state.gridSize) : state.food;

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    direction,
    score: newScore,
    speed: newSpeed,
  };
}

// 점수 계산 (랭킹용)
export function calculateScore(applesEaten: number, snakeLength: number): number {
  return applesEaten * 100 + (snakeLength - 3) * 50;
}

// 등급 계산
export function getGrade(score: number): { grade: string; color: string; description: string } {
  if (score >= 30) return { grade: 'S+', color: 'text-purple-500', description: '전설의 뱀!' };
  if (score >= 25) return { grade: 'S', color: 'text-purple-400', description: '뱀의 왕!' };
  if (score >= 20) return { grade: 'A+', color: 'text-red-500', description: '굉장해요!' };
  if (score >= 15) return { grade: 'A', color: 'text-orange-500', description: '멋져요!' };
  if (score >= 10) return { grade: 'B+', color: 'text-yellow-500', description: '좋아요!' };
  if (score >= 7) return { grade: 'B', color: 'text-green-500', description: '잘했어요!' };
  if (score >= 4) return { grade: 'C', color: 'text-blue-500', description: '괜찮아요!' };
  return { grade: 'D', color: 'text-gray-500', description: '연습이 필요해요' };
}

// 게임 상수 내보내기
export const CONSTANTS = {
  DEFAULT_GRID_SIZE,
  INITIAL_SPEED,
};
