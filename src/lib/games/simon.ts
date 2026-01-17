// 사이먼 게임 로직

export type Color = 'red' | 'blue' | 'green' | 'yellow';

export const COLORS: Color[] = ['red', 'blue', 'green', 'yellow'];

export interface GameState {
  sequence: Color[];
  playerSequence: Color[];
  isShowingSequence: boolean;
  currentShowIndex: number;
  level: number;
  isGameOver: boolean;
  score: number;
  highScore: number;
}

// 게임 초기화
export function initGame(): GameState {
  return {
    sequence: [],
    playerSequence: [],
    isShowingSequence: false,
    currentShowIndex: -1,
    level: 0,
    isGameOver: false,
    score: 0,
    highScore: getHighScore(),
  };
}

// 로컬 스토리지에서 최고 점수 가져오기
export function getHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem('simon_high_score');
  return saved ? parseInt(saved, 10) : 0;
}

// 최고 점수 저장
export function saveHighScore(score: number): void {
  if (typeof window === 'undefined') return;
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem('simon_high_score', score.toString());
  }
}

// 랜덤 색상 추가
export function addRandomColor(state: GameState): GameState {
  const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    ...state,
    sequence: [...state.sequence, randomColor],
    playerSequence: [],
    level: state.level + 1,
    isShowingSequence: true,
    currentShowIndex: 0,
  };
}

// 시퀀스 표시 다음 단계
export function nextShowStep(state: GameState): GameState {
  const nextIndex = state.currentShowIndex + 1;

  if (nextIndex >= state.sequence.length) {
    return {
      ...state,
      isShowingSequence: false,
      currentShowIndex: -1,
    };
  }

  return {
    ...state,
    currentShowIndex: nextIndex,
  };
}

// 플레이어 입력 처리
export function handlePlayerInput(state: GameState, color: Color): GameState {
  if (state.isShowingSequence || state.isGameOver) {
    return state;
  }

  const newPlayerSequence = [...state.playerSequence, color];
  const currentIndex = newPlayerSequence.length - 1;

  // 틀린 경우
  if (newPlayerSequence[currentIndex] !== state.sequence[currentIndex]) {
    saveHighScore(state.score);
    return {
      ...state,
      playerSequence: newPlayerSequence,
      isGameOver: true,
      highScore: Math.max(state.highScore, state.score),
    };
  }

  // 현재 시퀀스 완료
  if (newPlayerSequence.length === state.sequence.length) {
    const newScore = state.score + state.level * 10;
    return {
      ...state,
      playerSequence: newPlayerSequence,
      score: newScore,
    };
  }

  // 아직 진행 중
  return {
    ...state,
    playerSequence: newPlayerSequence,
  };
}

// 시퀀스 완료 여부 확인
export function isSequenceComplete(state: GameState): boolean {
  return (
    !state.isGameOver &&
    !state.isShowingSequence &&
    state.playerSequence.length === state.sequence.length &&
    state.sequence.length > 0
  );
}

// 점수 계산
export function calculateScore(level: number): number {
  // 레벨당 점수가 증가 (1레벨: 10점, 2레벨: 20점, ...)
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += i * 10;
  }
  return total;
}

// 색상별 스타일
export const COLOR_STYLES: Record<Color, { bg: string; active: string; border: string }> = {
  red: {
    bg: 'bg-red-500',
    active: 'bg-red-300 shadow-[0_0_30px_rgba(239,68,68,0.8)]',
    border: 'border-red-600',
  },
  blue: {
    bg: 'bg-blue-500',
    active: 'bg-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.8)]',
    border: 'border-blue-600',
  },
  green: {
    bg: 'bg-green-500',
    active: 'bg-green-300 shadow-[0_0_30px_rgba(34,197,94,0.8)]',
    border: 'border-green-600',
  },
  yellow: {
    bg: 'bg-yellow-400',
    active: 'bg-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.8)]',
    border: 'border-yellow-500',
  },
};
