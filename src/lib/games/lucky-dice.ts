// 럭키 다이스 (운빨 주사위 게임) 로직

export interface DiceResult {
  values: number[];
  total: number;
  bonus: BonusType | null;
  bonusMultiplier: number;
  score: number;
}

export type BonusType =
  | 'triple' // 같은 숫자 3개
  | 'straight' // 연속 숫자 (1-2-3, 2-3-4, etc)
  | 'pair' // 같은 숫자 2개
  | 'allSix' // 모두 6
  | 'allOne' // 모두 1
  | 'allFive' // 모두 5
  | 'lucky7' // 합이 7
  | 'death' // 444 (0점)
  | 'allOdd' // 모두 홀수
  | 'allEven' // 모두 짝수
  | 'big' // 합 16 이상
  | 'small'; // 합 5 이하

export interface GameState {
  rolls: DiceResult[];
  currentDice: number[];
  totalScore: number;
  highScore: number;
  rollsLeft: number;
  isRolling: boolean;
  lastBonus: BonusType | null;
}

const BONUS_CONFIG: Record<BonusType, { name: string; multiplier: number; emoji: string }> = {
  allSix: { name: '트리플 식스!', multiplier: 10, emoji: '🎰' },
  allFive: { name: '트리플 파이브!', multiplier: 8, emoji: '🖐️' },
  allOne: { name: '스네이크 아이즈!', multiplier: 5, emoji: '🐍' },
  death: { name: '데스 넘버!', multiplier: 0, emoji: '💀' },
  triple: { name: '트리플!', multiplier: 3, emoji: '🎯' },
  straight: { name: '스트레이트!', multiplier: 2.5, emoji: '📈' },
  big: { name: '빅!', multiplier: 2, emoji: '🔥' },
  small: { name: '스몰!', multiplier: 2, emoji: '🐜' },
  lucky7: { name: '럭키 세븐!', multiplier: 1.5, emoji: '🍀' },
  allOdd: { name: '올 홀수!', multiplier: 1.5, emoji: '🔮' },
  allEven: { name: '올 짝수!', multiplier: 1.5, emoji: '✨' },
  pair: { name: '페어!', multiplier: 1.2, emoji: '👯' },
};

// 게임 초기화
export function initGame(): GameState {
  return {
    rolls: [],
    currentDice: [1, 1, 1],
    totalScore: 0,
    highScore: getHighScore(),
    rollsLeft: 10,
    isRolling: false,
    lastBonus: null,
  };
}

// 로컬 스토리지에서 최고 점수 가져오기
export function getHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem('lucky_dice_high_score');
  return saved ? parseInt(saved, 10) : 0;
}

// 최고 점수 저장
export function saveHighScore(score: number): void {
  if (typeof window === 'undefined') return;
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem('lucky_dice_high_score', score.toString());
  }
}

// 주사위 굴리기
export function rollDice(): number[] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

// 보너스 확인
export function checkBonus(values: number[]): { bonus: BonusType | null; multiplier: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const total = values.reduce((sum, v) => sum + v, 0);

  // 💀 데스 넘버 (444) - 0점! 가장 먼저 체크
  if (values.every(v => v === 4)) {
    return { bonus: 'death', multiplier: BONUS_CONFIG.death.multiplier };
  }

  // 🎰 모두 6
  if (values.every(v => v === 6)) {
    return { bonus: 'allSix', multiplier: BONUS_CONFIG.allSix.multiplier };
  }

  // 🖐️ 모두 5
  if (values.every(v => v === 5)) {
    return { bonus: 'allFive', multiplier: BONUS_CONFIG.allFive.multiplier };
  }

  // 🐍 모두 1
  if (values.every(v => v === 1)) {
    return { bonus: 'allOne', multiplier: BONUS_CONFIG.allOne.multiplier };
  }

  // 🎯 트리플 (같은 숫자 3개 - 위에서 처리 안된 것들)
  if (values[0] === values[1] && values[1] === values[2]) {
    return { bonus: 'triple', multiplier: BONUS_CONFIG.triple.multiplier };
  }

  // 📈 스트레이트 (연속 숫자)
  if (sorted[1] === sorted[0] + 1 && sorted[2] === sorted[1] + 1) {
    return { bonus: 'straight', multiplier: BONUS_CONFIG.straight.multiplier };
  }

  // 🔥 빅 (합 16 이상)
  if (total >= 16) {
    return { bonus: 'big', multiplier: BONUS_CONFIG.big.multiplier };
  }

  // 🐜 스몰 (합 5 이하)
  if (total <= 5) {
    return { bonus: 'small', multiplier: BONUS_CONFIG.small.multiplier };
  }

  // 🍀 럭키 세븐 (합이 7)
  if (total === 7) {
    return { bonus: 'lucky7', multiplier: BONUS_CONFIG.lucky7.multiplier };
  }

  // 🔮 올 홀수
  if (values.every(v => v % 2 === 1)) {
    return { bonus: 'allOdd', multiplier: BONUS_CONFIG.allOdd.multiplier };
  }

  // ✨ 올 짝수
  if (values.every(v => v % 2 === 0)) {
    return { bonus: 'allEven', multiplier: BONUS_CONFIG.allEven.multiplier };
  }

  // 👯 페어 (같은 숫자 2개)
  if (sorted[0] === sorted[1] || sorted[1] === sorted[2]) {
    return { bonus: 'pair', multiplier: BONUS_CONFIG.pair.multiplier };
  }

  return { bonus: null, multiplier: 1 };
}

// 점수 계산
export function calculateRollScore(values: number[]): DiceResult {
  const total = values.reduce((sum, v) => sum + v, 0);
  const { bonus, multiplier } = checkBonus(values);
  // 기본 점수 = (합계 × 100) × 보너스배수
  const baseScore = total * 100;
  const score = Math.round(baseScore * multiplier);

  return {
    values,
    total,
    bonus,
    bonusMultiplier: multiplier,
    score,
  };
}

// 게임 상태 업데이트
export function doRoll(state: GameState): GameState {
  if (state.rollsLeft <= 0 || state.isRolling) {
    return state;
  }

  const values = rollDice();
  const result = calculateRollScore(values);
  const newTotalScore = state.totalScore + result.score;
  const newRollsLeft = state.rollsLeft - 1;

  const isGameOver = newRollsLeft === 0;
  if (isGameOver) {
    saveHighScore(newTotalScore);
  }

  return {
    ...state,
    rolls: [...state.rolls, result],
    currentDice: values,
    totalScore: newTotalScore,
    rollsLeft: newRollsLeft,
    lastBonus: result.bonus,
    highScore: isGameOver ? Math.max(state.highScore, newTotalScore) : state.highScore,
  };
}

// 보너스 정보 가져오기
export function getBonusInfo(bonus: BonusType): { name: string; multiplier: number; emoji: string } {
  return BONUS_CONFIG[bonus];
}

// 주사위 이모지
export function getDiceEmoji(value: number): string {
  const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  return emojis[value - 1] || '🎲';
}
