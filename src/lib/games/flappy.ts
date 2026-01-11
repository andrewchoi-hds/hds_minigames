// 플래피 버드 게임 로직

export type GameState = {
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  bestScore: number;
  bird: Bird;
  pipes: Pipe[];
  frameCount: number;
};

export type Bird = {
  x: number;
  y: number;
  velocityY: number;
  rotation: number;
};

export type Pipe = {
  id: number;
  x: number;
  gapY: number; // 갭의 중심 Y 좌표
  passed: boolean;
};

// 게임 상수
const GRAVITY = 0.35;
const JUMP_FORCE = -6.5;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 52;
const PIPE_GAP = 140; // 파이프 사이 갭
const PIPE_SPEED = 2.5;
const PIPE_SPAWN_INTERVAL = 100; // 프레임 단위
const GAME_HEIGHT = 400;
const GAME_WIDTH = 320;

// 초기화
export function initGame(): GameState {
  return {
    isPlaying: false,
    isGameOver: false,
    score: 0,
    bestScore: 0,
    bird: {
      x: 80,
      y: GAME_HEIGHT / 2,
      velocityY: 0,
      rotation: 0,
    },
    pipes: [],
    frameCount: 0,
  };
}

// 게임 시작
export function startGame(state: GameState): GameState {
  return {
    ...state,
    isPlaying: true,
    isGameOver: false,
    score: 0,
    bird: {
      x: 80,
      y: GAME_HEIGHT / 2,
      velocityY: JUMP_FORCE,
      rotation: -20,
    },
    pipes: [],
    frameCount: 0,
  };
}

// 점프
export function jump(state: GameState): GameState {
  if (state.isGameOver) return state;

  if (!state.isPlaying) {
    return startGame(state);
  }

  return {
    ...state,
    bird: {
      ...state.bird,
      velocityY: JUMP_FORCE,
      rotation: -20,
    },
  };
}

// 파이프 생성
function createPipe(id: number): Pipe {
  const minGapY = 80 + PIPE_GAP / 2;
  const maxGapY = GAME_HEIGHT - 80 - PIPE_GAP / 2;
  const gapY = minGapY + Math.random() * (maxGapY - minGapY);

  return {
    id,
    x: GAME_WIDTH + PIPE_WIDTH,
    gapY,
    passed: false,
  };
}

// 충돌 감지
function checkCollision(bird: Bird, pipes: Pipe[]): boolean {
  // 천장/바닥 충돌
  if (bird.y - BIRD_SIZE / 2 < 0 || bird.y + BIRD_SIZE / 2 > GAME_HEIGHT) {
    return true;
  }

  // 파이프 충돌
  for (const pipe of pipes) {
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + PIPE_WIDTH;
    const birdLeft = bird.x - BIRD_SIZE / 2;
    const birdRight = bird.x + BIRD_SIZE / 2;
    const birdTop = bird.y - BIRD_SIZE / 2;
    const birdBottom = bird.y + BIRD_SIZE / 2;

    // X축 겹침 확인
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      const gapTop = pipe.gapY - PIPE_GAP / 2;
      const gapBottom = pipe.gapY + PIPE_GAP / 2;

      // 갭 밖에 있으면 충돌
      if (birdTop < gapTop || birdBottom > gapBottom) {
        return true;
      }
    }
  }

  return false;
}

// 게임 업데이트
export function updateGame(state: GameState): GameState {
  if (!state.isPlaying || state.isGameOver) return state;

  const frameCount = state.frameCount + 1;

  // 새 물리 업데이트
  let newVelocityY = state.bird.velocityY + GRAVITY;
  let newY = state.bird.y + newVelocityY;

  // 회전 업데이트 (속도에 따라)
  let newRotation = Math.min(90, state.bird.rotation + 3);
  if (newVelocityY < 0) {
    newRotation = -20;
  }

  const newBird: Bird = {
    ...state.bird,
    y: newY,
    velocityY: newVelocityY,
    rotation: newRotation,
  };

  // 파이프 업데이트
  let newPipes = state.pipes.map(pipe => ({
    ...pipe,
    x: pipe.x - PIPE_SPEED,
  }));

  // 화면 밖 파이프 제거
  newPipes = newPipes.filter(pipe => pipe.x > -PIPE_WIDTH);

  // 새 파이프 생성
  if (frameCount % PIPE_SPAWN_INTERVAL === 0) {
    newPipes.push(createPipe(frameCount));
  }

  // 점수 계산 (파이프 통과)
  let newScore = state.score;
  newPipes = newPipes.map(pipe => {
    if (!pipe.passed && pipe.x + PIPE_WIDTH < newBird.x) {
      newScore++;
      return { ...pipe, passed: true };
    }
    return pipe;
  });

  // 충돌 확인
  if (checkCollision(newBird, newPipes)) {
    return {
      ...state,
      isGameOver: true,
      bird: newBird,
      pipes: newPipes,
      bestScore: Math.max(state.bestScore, newScore),
    };
  }

  return {
    ...state,
    bird: newBird,
    pipes: newPipes,
    score: newScore,
    frameCount,
  };
}

// 점수 계산 (랭킹용)
export function calculateScore(pipesCleared: number): number {
  return pipesCleared * 100;
}

// 등급 계산
export function getGrade(score: number): { grade: string; color: string; description: string } {
  if (score >= 50) return { grade: 'S+', color: 'text-purple-500', description: '전설의 새!' };
  if (score >= 40) return { grade: 'S', color: 'text-purple-400', description: '하늘의 왕자!' };
  if (score >= 30) return { grade: 'A+', color: 'text-red-500', description: '굉장해요!' };
  if (score >= 20) return { grade: 'A', color: 'text-orange-500', description: '멋져요!' };
  if (score >= 15) return { grade: 'B+', color: 'text-yellow-500', description: '좋아요!' };
  if (score >= 10) return { grade: 'B', color: 'text-green-500', description: '잘했어요!' };
  if (score >= 5) return { grade: 'C', color: 'text-blue-500', description: '괜찮아요!' };
  return { grade: 'D', color: 'text-gray-500', description: '연습이 필요해요' };
}

// 게임 상수 내보내기
export const CONSTANTS = {
  GAME_WIDTH,
  GAME_HEIGHT,
  BIRD_SIZE,
  PIPE_WIDTH,
  PIPE_GAP,
};
