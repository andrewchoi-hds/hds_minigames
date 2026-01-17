// 하이로우 (High-Low) 카드 게임 로직

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // 1-13
}

export interface GameState {
  currentCard: Card;
  nextCard: Card | null;
  deck: Card[];
  streak: number;
  maxStreak: number; // 최대 연속 기록
  score: number;
  highScore: number;
  isGameOver: boolean;
  lastGuess: 'high' | 'low' | 'same' | null;
  isCorrect: boolean | null;
  lives: number;
}

// 카드 덱 생성
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: { rank: Rank; value: number }[] = [
    { rank: 'A', value: 1 },
    { rank: '2', value: 2 },
    { rank: '3', value: 3 },
    { rank: '4', value: 4 },
    { rank: '5', value: 5 },
    { rank: '6', value: 6 },
    { rank: '7', value: 7 },
    { rank: '8', value: 8 },
    { rank: '9', value: 9 },
    { rank: '10', value: 10 },
    { rank: 'J', value: 11 },
    { rank: 'Q', value: 12 },
    { rank: 'K', value: 13 },
  ];

  const deck: Card[] = [];
  for (const suit of suits) {
    for (const { rank, value } of ranks) {
      deck.push({ suit, rank, value });
    }
  }

  return shuffleDeck(deck);
}

// 덱 셔플
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 게임 초기화
export function initGame(): GameState {
  const deck = createDeck();
  const currentCard = deck.pop()!;

  return {
    currentCard,
    nextCard: null,
    deck,
    streak: 0,
    maxStreak: 0,
    score: 0,
    highScore: getHighScore(),
    isGameOver: false,
    lastGuess: null,
    isCorrect: null,
    lives: 3,
  };
}

// 로컬 스토리지에서 최고 점수 가져오기
export function getHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem('high_low_high_score');
  return saved ? parseInt(saved, 10) : 0;
}

// 최고 점수 저장
export function saveHighScore(score: number): void {
  if (typeof window === 'undefined') return;
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem('high_low_high_score', score.toString());
  }
}

// 추측하기
export function makeGuess(state: GameState, guess: 'high' | 'low' | 'same'): GameState {
  if (state.isGameOver || state.deck.length === 0) {
    return state;
  }

  // 덱이 부족하면 새로 셔플
  let deck = [...state.deck];
  if (deck.length === 0) {
    deck = createDeck();
  }

  const nextCard = deck.pop()!;
  const currentValue = state.currentCard.value;
  const nextValue = nextCard.value;

  let isCorrect = false;
  if (guess === 'high') {
    isCorrect = nextValue > currentValue;
  } else if (guess === 'low') {
    isCorrect = nextValue < currentValue;
  } else {
    isCorrect = nextValue === currentValue;
  }

  // Same 맞추면 보너스
  const scoreGain = isCorrect ? (guess === 'same' ? 50 : 10 + state.streak * 5) : 0;
  const newStreak = isCorrect ? state.streak + 1 : 0;
  const newMaxStreak = Math.max(state.maxStreak, newStreak);
  const newScore = state.score + scoreGain;
  const newLives = isCorrect ? state.lives : state.lives - 1;
  const isGameOver = newLives <= 0;

  if (isGameOver) {
    saveHighScore(newScore);
  }

  return {
    currentCard: nextCard,
    nextCard: nextCard,
    deck,
    streak: newStreak,
    maxStreak: newMaxStreak,
    score: newScore,
    highScore: isGameOver ? Math.max(state.highScore, newScore) : state.highScore,
    isGameOver,
    lastGuess: guess,
    isCorrect,
    lives: newLives,
  };
}

// 카드 심볼 반환
export function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return symbols[suit];
}

// 카드 색상
export function getSuitColor(suit: Suit): string {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-gray-900 dark:text-white';
}

// 점수 계산
export function calculateFinalScore(score: number, streak: number): number {
  return score + streak * 10;
}
