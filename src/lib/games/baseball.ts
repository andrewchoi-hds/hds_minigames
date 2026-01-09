// 숫자 야구 게임 로직

export type Difficulty = '3digit' | '4digit';

export type GuessResult = {
  guess: string;
  strikes: number;
  balls: number;
};

export type GameState = {
  answer: string;
  guesses: GuessResult[];
  currentGuess: string;
  digitCount: number;
  isGameOver: boolean;
  isWon: boolean;
  startTime: number | null;
};

// 난이도별 설정
const DIFFICULTY_CONFIG: Record<Difficulty, { digits: number; label: string; description: string }> = {
  '3digit': { digits: 3, label: '3자리', description: '3자리 숫자 맞추기' },
  '4digit': { digits: 4, label: '4자리', description: '4자리 숫자 맞추기' },
};

export function getDifficultyConfig(difficulty: Difficulty) {
  return DIFFICULTY_CONFIG[difficulty];
}

// 랜덤 숫자 생성 (중복 없음)
function generateAnswer(digitCount: number): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const result: string[] = [];

  // 첫 자리는 0이 아니어야 함
  const firstIdx = 1 + Math.floor(Math.random() * 9);
  result.push(digits[firstIdx]);
  digits.splice(firstIdx, 1);

  // 나머지 자리
  for (let i = 1; i < digitCount; i++) {
    const idx = Math.floor(Math.random() * digits.length);
    result.push(digits[idx]);
    digits.splice(idx, 1);
  }

  return result.join('');
}

// 게임 초기화
export function initGame(difficulty: Difficulty): GameState {
  const { digits } = DIFFICULTY_CONFIG[difficulty];
  const answer = generateAnswer(digits);

  return {
    answer,
    guesses: [],
    currentGuess: '',
    digitCount: digits,
    isGameOver: false,
    isWon: false,
    startTime: null,
  };
}

// 스트라이크/볼 계산
export function calculateResult(answer: string, guess: string): { strikes: number; balls: number } {
  let strikes = 0;
  let balls = 0;

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) {
      strikes++;
    } else if (answer.includes(guess[i])) {
      balls++;
    }
  }

  return { strikes, balls };
}

// 입력 유효성 검사
export function isValidGuess(guess: string, digitCount: number): { valid: boolean; error: string } {
  if (guess.length !== digitCount) {
    return { valid: false, error: `${digitCount}자리 숫자를 입력하세요` };
  }

  if (!/^\d+$/.test(guess)) {
    return { valid: false, error: '숫자만 입력하세요' };
  }

  if (guess[0] === '0') {
    return { valid: false, error: '첫 자리는 0이 될 수 없습니다' };
  }

  const uniqueDigits = new Set(guess.split(''));
  if (uniqueDigits.size !== digitCount) {
    return { valid: false, error: '중복된 숫자가 있습니다' };
  }

  return { valid: true, error: '' };
}

// 추측 제출
export function submitGuess(state: GameState, guess: string): GameState {
  if (state.isGameOver) return state;

  const validation = isValidGuess(guess, state.digitCount);
  if (!validation.valid) return state;

  const { strikes, balls } = calculateResult(state.answer, guess);
  const newGuesses = [...state.guesses, { guess, strikes, balls }];
  const isWon = strikes === state.digitCount;

  return {
    ...state,
    guesses: newGuesses,
    currentGuess: '',
    isWon,
    isGameOver: isWon,
    startTime: state.startTime ?? Date.now(),
  };
}

// 현재 입력 업데이트
export function updateCurrentGuess(state: GameState, digit: string): GameState {
  if (state.isGameOver) return state;
  if (state.currentGuess.length >= state.digitCount) return state;

  // 첫 자리에 0 방지
  if (state.currentGuess.length === 0 && digit === '0') return state;

  // 중복 숫자 방지
  if (state.currentGuess.includes(digit)) return state;

  return {
    ...state,
    currentGuess: state.currentGuess + digit,
    startTime: state.startTime ?? Date.now(),
  };
}

// 마지막 숫자 삭제
export function deleteLastDigit(state: GameState): GameState {
  if (state.isGameOver) return state;
  if (state.currentGuess.length === 0) return state;

  return {
    ...state,
    currentGuess: state.currentGuess.slice(0, -1),
  };
}

// 힌트 텍스트
export function getHintText(strikes: number, balls: number): string {
  if (strikes === 0 && balls === 0) {
    return '아웃!';
  }

  const parts: string[] = [];
  if (strikes > 0) parts.push(`${strikes}S`);
  if (balls > 0) parts.push(`${balls}B`);

  return parts.join(' ');
}

// 결과 색상
export function getResultColor(strikes: number, balls: number, digitCount: number): string {
  if (strikes === digitCount) {
    return 'text-green-500';
  }
  if (strikes > 0) {
    return 'text-yellow-500';
  }
  if (balls > 0) {
    return 'text-blue-500';
  }
  return 'text-gray-500';
}
