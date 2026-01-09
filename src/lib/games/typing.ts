// 타이핑 게임 로직

// 단어 목록 (쉬운 단어부터 어려운 단어까지)
const WORD_LIST = {
  easy: [
    'cat', 'dog', 'sun', 'run', 'fun', 'cup', 'hat', 'bat', 'red', 'bed',
    'pen', 'ten', 'box', 'fox', 'hot', 'top', 'map', 'cap', 'big', 'pig',
    'sit', 'hit', 'win', 'pin', 'bus', 'cut', 'nut', 'put', 'get', 'let',
    'yes', 'jet', 'web', 'wet', 'leg', 'beg', 'set', 'pet', 'net', 'met',
  ],
  normal: [
    'apple', 'beach', 'candy', 'dance', 'eagle', 'flame', 'grape', 'horse',
    'index', 'juice', 'knife', 'lemon', 'mango', 'night', 'ocean', 'piano',
    'queen', 'river', 'snake', 'tiger', 'uncle', 'video', 'water', 'xenon',
    'youth', 'zebra', 'brain', 'cloud', 'dream', 'earth', 'frost', 'ghost',
    'heart', 'ivory', 'jolly', 'karma', 'light', 'magic', 'noble', 'orbit',
    'peace', 'quick', 'radio', 'storm', 'train', 'umbra', 'vivid', 'world',
  ],
  hard: [
    'amazing', 'balance', 'capture', 'dynamic', 'elegant', 'fantasy', 'genuine',
    'harmony', 'imagine', 'journey', 'kitchen', 'library', 'mystery', 'natural',
    'obvious', 'patient', 'quality', 'regular', 'special', 'triumph', 'unusual',
    'variety', 'weather', 'xylophone', 'younger', 'zealous', 'absolute', 'behavior',
    'creative', 'discover', 'exchange', 'feedback', 'graduate', 'hospital',
    'internet', 'judgment', 'keyboard', 'language', 'mountain', 'negative',
    'opposite', 'positive', 'question', 'response', 'standard', 'together',
    'universe', 'valuable', 'whenever', 'yourself', 'champion', 'dialogue',
  ],
};

export type Difficulty = 'easy' | 'normal' | 'hard';

export type FallingWord = {
  id: number;
  word: string;
  x: number; // 0-100 (%)
  y: number; // 0-100 (%)
  speed: number;
};

export type GameState = {
  words: FallingWord[];
  currentInput: string;
  score: number;
  combo: number;
  maxCombo: number;
  wordsTyped: number;
  wordsMissed: number;
  correctChars: number;
  totalChars: number;
  isGameOver: boolean;
  difficulty: Difficulty;
  timeLeft: number; // 초
  gameDuration: number; // 총 게임 시간
};

// 난이도별 설정
const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; spawnInterval: number; baseSpeed: number; wordPool: string[] }
> = {
  easy: {
    label: '쉬움',
    spawnInterval: 2000,
    baseSpeed: 0.3,
    wordPool: WORD_LIST.easy,
  },
  normal: {
    label: '보통',
    spawnInterval: 1500,
    baseSpeed: 0.5,
    wordPool: [...WORD_LIST.easy, ...WORD_LIST.normal],
  },
  hard: {
    label: '어려움',
    spawnInterval: 1000,
    baseSpeed: 0.7,
    wordPool: [...WORD_LIST.normal, ...WORD_LIST.hard],
  },
};

export function getDifficultyConfig(difficulty: Difficulty) {
  return DIFFICULTY_CONFIG[difficulty];
}

let wordIdCounter = 0;

// 랜덤 단어 생성
export function createWord(difficulty: Difficulty): FallingWord {
  const config = DIFFICULTY_CONFIG[difficulty];
  const word = config.wordPool[Math.floor(Math.random() * config.wordPool.length)];

  return {
    id: ++wordIdCounter,
    word,
    x: Math.random() * 80 + 10, // 10% ~ 90%
    y: 0,
    speed: config.baseSpeed + Math.random() * 0.2,
  };
}

// 게임 초기화
export function initGame(difficulty: Difficulty, duration: number = 60): GameState {
  wordIdCounter = 0;

  return {
    words: [],
    currentInput: '',
    score: 0,
    combo: 0,
    maxCombo: 0,
    wordsTyped: 0,
    wordsMissed: 0,
    correctChars: 0,
    totalChars: 0,
    isGameOver: false,
    difficulty,
    timeLeft: duration,
    gameDuration: duration,
  };
}

// 단어 추가
export function addWord(state: GameState): GameState {
  if (state.isGameOver) return state;

  const newWord = createWord(state.difficulty);
  return {
    ...state,
    words: [...state.words, newWord],
  };
}

// 단어 이동 (프레임당 호출)
export function updateWords(state: GameState, deltaTime: number): GameState {
  if (state.isGameOver) return state;

  let wordsMissed = state.wordsMissed;
  let combo = state.combo;

  const updatedWords = state.words
    .map((word) => ({
      ...word,
      y: word.y + word.speed * deltaTime * 0.1,
    }))
    .filter((word) => {
      if (word.y >= 100) {
        wordsMissed++;
        combo = 0;
        return false;
      }
      return true;
    });

  return {
    ...state,
    words: updatedWords,
    wordsMissed,
    combo,
  };
}

// 입력 처리
export function handleInput(state: GameState, input: string): GameState {
  if (state.isGameOver) return state;

  const matchedWord = state.words.find((w) => w.word.toLowerCase() === input.toLowerCase());

  if (matchedWord) {
    // 정확히 맞춤
    const newCombo = state.combo + 1;
    const comboBonus = Math.floor(newCombo / 5) * 10;
    const wordScore = matchedWord.word.length * 10 + comboBonus;

    return {
      ...state,
      words: state.words.filter((w) => w.id !== matchedWord.id),
      currentInput: '',
      score: state.score + wordScore,
      combo: newCombo,
      maxCombo: Math.max(state.maxCombo, newCombo),
      wordsTyped: state.wordsTyped + 1,
      correctChars: state.correctChars + matchedWord.word.length,
      totalChars: state.totalChars + input.length,
    };
  }

  return {
    ...state,
    currentInput: input,
  };
}

// 시간 업데이트
export function updateTime(state: GameState): GameState {
  if (state.isGameOver) return state;

  const newTimeLeft = state.timeLeft - 1;
  const isGameOver = newTimeLeft <= 0;

  return {
    ...state,
    timeLeft: Math.max(0, newTimeLeft),
    isGameOver,
  };
}

// WPM 계산 (분당 타자 수)
export function calculateWPM(state: GameState): number {
  const elapsedMinutes = (state.gameDuration - state.timeLeft) / 60;
  if (elapsedMinutes <= 0) return 0;

  // 평균 단어 길이 5자 기준
  const wordsTyped = state.correctChars / 5;
  return Math.round(wordsTyped / elapsedMinutes);
}

// 정확도 계산
export function calculateAccuracy(state: GameState): number {
  if (state.totalChars === 0) return 100;
  return Math.round((state.correctChars / state.totalChars) * 100);
}

// 매칭되는 단어 하이라이트
export function getMatchingWords(words: FallingWord[], input: string): number[] {
  if (!input) return [];

  return words
    .filter((w) => w.word.toLowerCase().startsWith(input.toLowerCase()))
    .map((w) => w.id);
}
