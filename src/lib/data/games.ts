export type GameCategory = 'all' | 'puzzle' | 'action' | 'brain';

export type GameInfo = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: GameCategory;
  isNew?: boolean;
  isPopular?: boolean;
  gradient: string;
};

export const GAME_CATEGORIES: { id: GameCategory; name: string; icon: string }[] = [
  { id: 'all', name: '전체', icon: '🎮' },
  { id: 'puzzle', name: '퍼즐', icon: '🧩' },
  { id: 'action', name: '액션', icon: '🎯' },
  { id: 'brain', name: '두뇌', icon: '🧠' },
];

export const GAMES: GameInfo[] = [
  // 퍼즐 게임
  {
    id: 'sudoku',
    name: '스도쿠',
    description: '숫자 퍼즐의 고전',
    emoji: '🔢',
    category: 'puzzle',
    isPopular: true,
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'puzzle-2048',
    name: '2048',
    description: '숫자를 합쳐 2048을 만들어라',
    emoji: '🎯',
    category: 'puzzle',
    isPopular: true,
    gradient: 'from-orange-400 to-red-500',
  },
  {
    id: 'sliding-puzzle',
    name: '슬라이딩 퍼즐',
    description: '숫자를 순서대로 정렬하세요',
    emoji: '🧩',
    category: 'puzzle',
    gradient: 'from-cyan-400 to-blue-500',
  },

  // 액션 게임
  {
    id: 'flappy',
    name: '플래피 버드',
    description: '파이프 사이를 날아서 통과하세요',
    emoji: '🐦',
    category: 'action',
    isNew: true,
    gradient: 'from-sky-400 to-blue-500',
  },
  {
    id: 'snake',
    name: '뱀 게임',
    description: '사과를 먹으며 뱀을 키우세요',
    emoji: '🐍',
    category: 'action',
    isNew: true,
    gradient: 'from-green-400 to-lime-500',
  },
  {
    id: 'breakout',
    name: '벽돌깨기',
    description: '공을 튕겨 벽돌을 모두 깨세요',
    emoji: '🧱',
    category: 'action',
    isNew: true,
    gradient: 'from-red-500 to-pink-600',
  },

  // 두뇌 게임
  {
    id: 'memory',
    name: '메모리 게임',
    description: '카드 짝 맞추기',
    emoji: '🃏',
    category: 'brain',
    gradient: 'from-pink-400 to-rose-500',
  },
  {
    id: 'minesweeper',
    name: '지뢰찾기',
    description: '지뢰를 피해 모든 칸을 열어라',
    emoji: '💣',
    category: 'brain',
    isPopular: true,
    gradient: 'from-gray-600 to-gray-800',
  },
  {
    id: 'wordle',
    name: '워들',
    description: '5글자 영단어 맞추기',
    emoji: '📝',
    category: 'brain',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'typing',
    name: '타이핑 게임',
    description: '떨어지는 단어를 빠르게 타이핑',
    emoji: '⌨️',
    category: 'brain',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'reaction',
    name: '반응속도 테스트',
    description: '당신의 반응속도를 측정하세요',
    emoji: '⚡',
    category: 'brain',
    gradient: 'from-yellow-400 to-amber-500',
  },
  {
    id: 'baseball',
    name: '숫자 야구',
    description: '숫자를 추리하여 정답을 맞추세요',
    emoji: '⚾',
    category: 'brain',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    id: 'color-match',
    name: '색상 맞추기',
    description: '스트룹 효과를 경험해보세요',
    emoji: '🎨',
    category: 'brain',
    isNew: true,
    gradient: 'from-purple-500 to-pink-500',
  },
];

// 인기 게임 필터
export const getPopularGames = () => GAMES.filter((g) => g.isPopular);

// 새로운 게임 필터
export const getNewGames = () => GAMES.filter((g) => g.isNew);

// 카테고리별 필터
export const getGamesByCategory = (category: GameCategory) => {
  if (category === 'all') return GAMES;
  return GAMES.filter((g) => g.category === category);
};
