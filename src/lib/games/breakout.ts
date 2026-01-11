// 벽돌깨기 게임 로직

export type GameState = {
  isPlaying: boolean;
  isGameOver: boolean;
  isWin: boolean;
  score: number;
  lives: number;
  level: number;
  paddle: Paddle;
  ball: Ball;
  bricks: Brick[];
  powerUps: PowerUp[];
  combo: number;
  maxCombo: number;
};

export type Paddle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Ball = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
};

export type Brick = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hits: number; // 남은 히트 수
  color: string;
  points: number;
};

export type PowerUp = {
  id: number;
  x: number;
  y: number;
  type: 'wide' | 'life' | 'multi';
  dy: number;
};

// 게임 상수
const GAME_WIDTH = 320;
const GAME_HEIGHT = 480;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 10;
const PADDLE_Y = GAME_HEIGHT - 30;
const BALL_RADIUS = 6;
const BALL_SPEED = 4;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 36;
const BRICK_HEIGHT = 15;
const BRICK_PADDING = 2;
const BRICK_TOP = 50;
const BRICK_LEFT = (GAME_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING))) / 2;

// 색상 및 점수
const BRICK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
const BRICK_POINTS = [50, 40, 30, 20, 10];

// 초기화
export function initGame(): GameState {
  return {
    isPlaying: false,
    isGameOver: false,
    isWin: false,
    score: 0,
    lives: 3,
    level: 1,
    paddle: {
      x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: PADDLE_Y,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    },
    ball: {
      x: GAME_WIDTH / 2,
      y: PADDLE_Y - BALL_RADIUS - 1,
      dx: 0,
      dy: 0,
      radius: BALL_RADIUS,
      speed: BALL_SPEED,
    },
    bricks: generateBricks(),
    powerUps: [],
    combo: 0,
    maxCombo: 0,
  };
}

// 벽돌 생성
function generateBricks(): Brick[] {
  const bricks: Brick[] = [];
  let id = 0;

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        id: id++,
        x: BRICK_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
        y: BRICK_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits: row === 0 ? 2 : 1, // 첫 줄은 2번 쳐야 함
        color: BRICK_COLORS[row],
        points: BRICK_POINTS[row],
      });
    }
  }

  return bricks;
}

// 게임 시작
export function startGame(state: GameState): GameState {
  const angle = -Math.PI / 4 + Math.random() * (-Math.PI / 2); // -45도 ~ -135도
  return {
    ...state,
    isPlaying: true,
    ball: {
      ...state.ball,
      dx: Math.cos(angle) * state.ball.speed,
      dy: Math.sin(angle) * state.ball.speed,
    },
  };
}

// 패들 이동
export function movePaddle(state: GameState, x: number): GameState {
  const newX = Math.max(0, Math.min(GAME_WIDTH - state.paddle.width, x - state.paddle.width / 2));
  return {
    ...state,
    paddle: {
      ...state.paddle,
      x: newX,
    },
    // 시작 전에는 공도 패들과 함께 이동
    ball: state.ball.dy === 0 ? {
      ...state.ball,
      x: newX + state.paddle.width / 2,
    } : state.ball,
  };
}

// 게임 업데이트
export function updateGame(state: GameState): GameState {
  if (!state.isPlaying || state.isGameOver) return state;

  const { ball, bricks, powerUps } = state;
  let paddle = state.paddle;
  let score = state.score;
  let lives = state.lives;
  let combo = state.combo;
  let maxCombo = state.maxCombo;
  let isWin = false;
  let isGameOver = false;

  // 공 이동
  let newBallX = ball.x + ball.dx;
  let newBallY = ball.y + ball.dy;
  let newDx = ball.dx;
  let newDy = ball.dy;

  // 좌우 벽 충돌
  if (newBallX - ball.radius < 0 || newBallX + ball.radius > GAME_WIDTH) {
    newDx = -newDx;
    newBallX = newBallX - ball.radius < 0 ? ball.radius : GAME_WIDTH - ball.radius;
  }

  // 상단 벽 충돌
  if (newBallY - ball.radius < 0) {
    newDy = -newDy;
    newBallY = ball.radius;
  }

  // 하단 (공 놓침)
  if (newBallY + ball.radius > GAME_HEIGHT) {
    lives--;
    combo = 0;

    if (lives <= 0) {
      isGameOver = true;
    } else {
      // 리셋 위치
      newBallX = paddle.x + paddle.width / 2;
      newBallY = PADDLE_Y - ball.radius - 1;
      newDx = 0;
      newDy = 0;
    }
  }

  // 패들 충돌
  if (
    newDy > 0 &&
    newBallY + ball.radius >= paddle.y &&
    newBallY - ball.radius <= paddle.y + paddle.height &&
    newBallX >= paddle.x &&
    newBallX <= paddle.x + paddle.width
  ) {
    // 패들 위치에 따라 반사 각도 조절
    const hitPos = (newBallX - paddle.x) / paddle.width; // 0 ~ 1
    const angle = -Math.PI / 4 - hitPos * (Math.PI / 2); // -135도 ~ -45도
    newDx = Math.cos(angle) * ball.speed;
    newDy = Math.sin(angle) * ball.speed;
    newBallY = paddle.y - ball.radius;
  }

  // 벽돌 충돌
  let newBricks = [...bricks];
  let newPowerUps = [...powerUps];
  let brickHit = false;

  for (let i = newBricks.length - 1; i >= 0; i--) {
    const brick = newBricks[i];

    if (
      newBallX + ball.radius > brick.x &&
      newBallX - ball.radius < brick.x + brick.width &&
      newBallY + ball.radius > brick.y &&
      newBallY - ball.radius < brick.y + brick.height
    ) {
      // 충돌 방향 계산
      const overlapLeft = newBallX + ball.radius - brick.x;
      const overlapRight = brick.x + brick.width - (newBallX - ball.radius);
      const overlapTop = newBallY + ball.radius - brick.y;
      const overlapBottom = brick.y + brick.height - (newBallY - ball.radius);

      const minOverlapX = Math.min(overlapLeft, overlapRight);
      const minOverlapY = Math.min(overlapTop, overlapBottom);

      if (minOverlapX < minOverlapY) {
        newDx = -newDx;
      } else {
        newDy = -newDy;
      }

      brick.hits--;
      if (brick.hits <= 0) {
        score += brick.points * (1 + Math.floor(combo / 5));
        combo++;
        maxCombo = Math.max(maxCombo, combo);
        newBricks.splice(i, 1);

        // 파워업 드롭 (10% 확률)
        if (Math.random() < 0.1) {
          const types: PowerUp['type'][] = ['wide', 'life', 'multi'];
          newPowerUps.push({
            id: Date.now() + Math.random(),
            x: brick.x + brick.width / 2,
            y: brick.y,
            type: types[Math.floor(Math.random() * types.length)],
            dy: 2,
          });
        }
      }

      brickHit = true;
      break; // 한 프레임에 하나의 벽돌만 충돌
    }
  }

  if (!brickHit && ball.dy !== 0) {
    // 콤보 리셋 (패들에 닿을 때마다)
    if (newDy < 0 && ball.dy > 0) {
      combo = 0;
    }
  }

  // 모든 벽돌 파괴 시 승리
  if (newBricks.length === 0) {
    isWin = true;
    isGameOver = true;
  }

  // 파워업 업데이트
  newPowerUps = newPowerUps.filter(powerUp => {
    powerUp.y += powerUp.dy;

    // 패들과 충돌
    if (
      powerUp.y + 10 >= paddle.y &&
      powerUp.y <= paddle.y + paddle.height &&
      powerUp.x >= paddle.x &&
      powerUp.x <= paddle.x + paddle.width
    ) {
      // 파워업 효과
      switch (powerUp.type) {
        case 'wide':
          paddle = { ...paddle, width: Math.min(120, paddle.width + 20) };
          break;
        case 'life':
          lives = Math.min(5, lives + 1);
          break;
        case 'multi':
          score += 100;
          break;
      }
      return false;
    }

    return powerUp.y < GAME_HEIGHT;
  });

  return {
    ...state,
    ball: {
      ...ball,
      x: newBallX,
      y: newBallY,
      dx: newDx,
      dy: newDy,
    },
    paddle,
    bricks: newBricks,
    powerUps: newPowerUps,
    score,
    lives,
    combo,
    maxCombo,
    isWin,
    isGameOver,
    isPlaying: !isGameOver && (newDx !== 0 || newDy !== 0),
  };
}

// 점수 계산 (랭킹용)
export function calculateScore(score: number, bricksCleared: number, maxCombo: number): number {
  const comboBonus = maxCombo * 50;
  return score + comboBonus;
}

// 등급 계산
export function getGrade(score: number): { grade: string; color: string; description: string } {
  if (score >= 5000) return { grade: 'S+', color: 'text-purple-500', description: '벽돌의 지배자!' };
  if (score >= 4000) return { grade: 'S', color: 'text-purple-400', description: '대단해요!' };
  if (score >= 3000) return { grade: 'A+', color: 'text-red-500', description: '굉장해요!' };
  if (score >= 2000) return { grade: 'A', color: 'text-orange-500', description: '멋져요!' };
  if (score >= 1500) return { grade: 'B+', color: 'text-yellow-500', description: '좋아요!' };
  if (score >= 1000) return { grade: 'B', color: 'text-green-500', description: '잘했어요!' };
  if (score >= 500) return { grade: 'C', color: 'text-blue-500', description: '괜찮아요!' };
  return { grade: 'D', color: 'text-gray-500', description: '연습이 필요해요' };
}

// 게임 상수 내보내기
export const CONSTANTS = {
  GAME_WIDTH,
  GAME_HEIGHT,
  BRICK_ROWS,
  BRICK_COLS,
};
