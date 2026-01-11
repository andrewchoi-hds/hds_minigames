// 색상 맞추기 게임 로직

export type GameState = {
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  lives: number;
  round: number;
  timeLeft: number;
  targetColor: string;
  displayedWord: string;
  displayedWordColor: string;
  options: ColorOption[];
  correctAnswer: 'word' | 'color'; // word: 단어 뜻 맞추기, color: 글자색 맞추기
  questionType: 'word' | 'color';
  streak: number;
  maxStreak: number;
};

export type ColorOption = {
  id: number;
  name: string;
  hex: string;
  isCorrect: boolean;
};

// 색상 데이터
const COLORS = [
  { name: '빨강', hex: '#ef4444' },
  { name: '파랑', hex: '#3b82f6' },
  { name: '초록', hex: '#22c55e' },
  { name: '노랑', hex: '#eab308' },
  { name: '보라', hex: '#8b5cf6' },
  { name: '주황', hex: '#f97316' },
  { name: '분홍', hex: '#ec4899' },
  { name: '하늘', hex: '#06b6d4' },
];

// 게임 상수
const INITIAL_TIME = 30; // 초
const TIME_BONUS = 2; // 정답 시 추가 시간
const INITIAL_LIVES = 3;

// 초기화
export function initGame(): GameState {
  const question = generateQuestion();
  return {
    isPlaying: false,
    isGameOver: false,
    score: 0,
    lives: INITIAL_LIVES,
    round: 1,
    timeLeft: INITIAL_TIME,
    targetColor: question.targetColor,
    displayedWord: question.displayedWord,
    displayedWordColor: question.displayedWordColor,
    options: question.options,
    correctAnswer: question.correctAnswer,
    questionType: question.questionType,
    streak: 0,
    maxStreak: 0,
  };
}

// 문제 생성
function generateQuestion(): {
  targetColor: string;
  displayedWord: string;
  displayedWordColor: string;
  options: ColorOption[];
  correctAnswer: 'word' | 'color';
  questionType: 'word' | 'color';
} {
  // 랜덤하게 "단어" 또는 "색상" 질문 선택
  const questionType: 'word' | 'color' = Math.random() < 0.5 ? 'word' : 'color';

  // 랜덤 색상 2개 선택 (단어용, 글자색용)
  const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
  const wordColor = shuffledColors[0]; // 단어가 표시하는 색상
  const textColor = shuffledColors[1]; // 글자 자체의 색상

  // 정답 색상
  const correctColor = questionType === 'word' ? wordColor : textColor;

  // 오답 옵션 생성 (정답 포함 4개)
  const otherColors = COLORS.filter(c => c.name !== correctColor.name);
  const wrongOptions = otherColors.sort(() => Math.random() - 0.5).slice(0, 3);

  const options: ColorOption[] = [
    { id: 0, name: correctColor.name, hex: correctColor.hex, isCorrect: true },
    ...wrongOptions.map((c, i) => ({ id: i + 1, name: c.name, hex: c.hex, isCorrect: false })),
  ].sort(() => Math.random() - 0.5);

  return {
    targetColor: correctColor.hex,
    displayedWord: wordColor.name,
    displayedWordColor: textColor.hex,
    options,
    correctAnswer: questionType,
    questionType,
  };
}

// 게임 시작
export function startGame(state: GameState): GameState {
  return {
    ...state,
    isPlaying: true,
    isGameOver: false,
    score: 0,
    lives: INITIAL_LIVES,
    round: 1,
    timeLeft: INITIAL_TIME,
    streak: 0,
    maxStreak: 0,
  };
}

// 답변 선택
export function selectAnswer(state: GameState, optionId: number): GameState {
  if (!state.isPlaying || state.isGameOver) return state;

  const selectedOption = state.options.find(o => o.id === optionId);
  if (!selectedOption) return state;

  const isCorrect = selectedOption.isCorrect;

  if (isCorrect) {
    // 정답
    const newStreak = state.streak + 1;
    const streakBonus = Math.floor(newStreak / 3) * 10;
    const newScore = state.score + 100 + streakBonus;
    const newTimeLeft = Math.min(60, state.timeLeft + TIME_BONUS);

    const newQuestion = generateQuestion();

    return {
      ...state,
      score: newScore,
      round: state.round + 1,
      timeLeft: newTimeLeft,
      streak: newStreak,
      maxStreak: Math.max(state.maxStreak, newStreak),
      ...newQuestion,
    };
  } else {
    // 오답
    const newLives = state.lives - 1;

    if (newLives <= 0) {
      return {
        ...state,
        lives: 0,
        isGameOver: true,
        streak: 0,
      };
    }

    const newQuestion = generateQuestion();

    return {
      ...state,
      lives: newLives,
      round: state.round + 1,
      streak: 0,
      ...newQuestion,
    };
  }
}

// 시간 감소
export function decreaseTime(state: GameState): GameState {
  if (!state.isPlaying || state.isGameOver) return state;

  const newTimeLeft = state.timeLeft - 1;

  if (newTimeLeft <= 0) {
    return {
      ...state,
      timeLeft: 0,
      isGameOver: true,
    };
  }

  return {
    ...state,
    timeLeft: newTimeLeft,
  };
}

// 점수 계산 (랭킹용)
export function calculateScore(score: number, rounds: number, maxStreak: number): number {
  const roundBonus = rounds * 10;
  const streakBonus = maxStreak * 50;
  return score + roundBonus + streakBonus;
}

// 등급 계산
export function getGrade(score: number): { grade: string; color: string; description: string } {
  if (score >= 3000) return { grade: 'S+', color: 'text-purple-500', description: '색상의 달인!' };
  if (score >= 2500) return { grade: 'S', color: 'text-purple-400', description: '대단해요!' };
  if (score >= 2000) return { grade: 'A+', color: 'text-red-500', description: '굉장해요!' };
  if (score >= 1500) return { grade: 'A', color: 'text-orange-500', description: '멋져요!' };
  if (score >= 1000) return { grade: 'B+', color: 'text-yellow-500', description: '좋아요!' };
  if (score >= 500) return { grade: 'B', color: 'text-green-500', description: '잘했어요!' };
  if (score >= 300) return { grade: 'C', color: 'text-blue-500', description: '괜찮아요!' };
  return { grade: 'D', color: 'text-gray-500', description: '연습이 필요해요' };
}

// 게임 상수 내보내기
export const CONSTANTS = {
  INITIAL_TIME,
  TIME_BONUS,
  INITIAL_LIVES,
  COLORS,
};
