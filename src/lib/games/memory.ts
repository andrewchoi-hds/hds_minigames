// 메모리 카드 게임 로직

export type Difficulty = 'easy' | 'normal' | 'hard';

export type Card = {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export type GameState = {
  cards: Card[];
  flippedCards: number[]; // 현재 뒤집힌 카드 id들
  moves: number;
  matches: number;
  totalPairs: number;
  isComplete: boolean;
};

// 아이콘 목록 (이모지 사용 - 용량 절약)
const ICONS = [
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑',
  '🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🪻', '🌼',
  '🐶', '🐱', '🐼', '🐨', '🦊', '🐰', '🐻', '🦁',
  '⭐', '🌙', '☀️', '⚡', '🔥', '💧', '❄️', '🌈',
];

// 난이도별 설정
const DIFFICULTY_CONFIG: Record<Difficulty, { pairs: number; cols: number }> = {
  easy: { pairs: 6, cols: 4 },    // 3x4 = 12장 (6쌍)
  normal: { pairs: 8, cols: 4 },  // 4x4 = 16장 (8쌍)
  hard: { pairs: 12, cols: 6 },   // 4x6 = 24장 (12쌍)
};

export function getDifficultyConfig(difficulty: Difficulty) {
  return DIFFICULTY_CONFIG[difficulty];
}

// 배열 섞기
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 새 게임 초기화
export function initGame(difficulty: Difficulty): GameState {
  const { pairs } = DIFFICULTY_CONFIG[difficulty];

  // 랜덤 아이콘 선택
  const selectedIcons = shuffle(ICONS).slice(0, pairs);

  // 카드 쌍 생성
  const cardPairs = selectedIcons.flatMap((icon, index) => [
    { id: index * 2, icon, isFlipped: false, isMatched: false },
    { id: index * 2 + 1, icon, isFlipped: false, isMatched: false },
  ]);

  // 카드 섞기
  const shuffledCards = shuffle(cardPairs);

  return {
    cards: shuffledCards,
    flippedCards: [],
    moves: 0,
    matches: 0,
    totalPairs: pairs,
    isComplete: false,
  };
}

// 카드 뒤집기
export function flipCard(state: GameState, cardId: number): GameState {
  // 이미 2장 뒤집혀 있거나, 매치된 카드거나, 이미 뒤집힌 카드면 무시
  const card = state.cards.find(c => c.id === cardId);
  if (
    state.flippedCards.length >= 2 ||
    !card ||
    card.isMatched ||
    card.isFlipped
  ) {
    return state;
  }

  const newCards = state.cards.map(c =>
    c.id === cardId ? { ...c, isFlipped: true } : c
  );

  const newFlippedCards = [...state.flippedCards, cardId];

  return {
    ...state,
    cards: newCards,
    flippedCards: newFlippedCards,
  };
}

// 뒤집힌 카드 2장 확인 (매치 또는 되돌리기)
export function checkMatch(state: GameState): GameState {
  if (state.flippedCards.length !== 2) return state;

  const [firstId, secondId] = state.flippedCards;
  const firstCard = state.cards.find(c => c.id === firstId);
  const secondCard = state.cards.find(c => c.id === secondId);

  if (!firstCard || !secondCard) return state;

  const isMatch = firstCard.icon === secondCard.icon;

  let newCards: Card[];
  let newMatches = state.matches;

  if (isMatch) {
    // 매치 성공
    newCards = state.cards.map(c =>
      c.id === firstId || c.id === secondId
        ? { ...c, isMatched: true }
        : c
    );
    newMatches += 1;
  } else {
    // 매치 실패 - 카드 되돌리기
    newCards = state.cards.map(c =>
      c.id === firstId || c.id === secondId
        ? { ...c, isFlipped: false }
        : c
    );
  }

  const isComplete = newMatches === state.totalPairs;

  return {
    ...state,
    cards: newCards,
    flippedCards: [],
    moves: state.moves + 1,
    matches: newMatches,
    isComplete,
  };
}

// 별점 계산 (적은 시도로 클리어할수록 높은 점수)
export function calculateStars(moves: number, totalPairs: number): number {
  const perfectMoves = totalPairs; // 최소 시도 횟수
  const ratio = moves / perfectMoves;

  if (ratio <= 1.5) return 3;
  if (ratio <= 2.5) return 2;
  return 1;
}

// 점수 계산
export function calculateScore(moves: number, totalPairs: number, timeSeconds: number): number {
  const baseScore = totalPairs * 1000;
  const movesPenalty = Math.max(0, (moves - totalPairs) * 50);
  const timePenalty = Math.floor(timeSeconds / 10) * 10;

  return Math.max(0, baseScore - movesPenalty - timePenalty);
}
