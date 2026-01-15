'use client';

import {
  Grid3X3,
  Layers,
  Brain,
  Bomb,
  Type,
  LayoutGrid,
  Keyboard,
  Zap,
  Target,
  Bird,
  Gamepad2,
  Palette,
  LucideIcon,
} from 'lucide-react';

// 뱀 아이콘 (커스텀 SVG)
function SnakeIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 12c0-2 1-3 3-3h2c2 0 3 1 3 3s1 3 3 3h2c2 0 3-1 3-3" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
      <path d="M4 12v2" />
    </svg>
  );
}

// 벽돌 아이콘 (커스텀 SVG)
function BrickIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="8" height="4" rx="1" />
      <rect x="13" y="10" width="8" height="4" rx="1" />
      <rect x="3" y="16" width="18" height="4" rx="1" />
    </svg>
  );
}

type GameIconProps = {
  className?: string;
  size?: number;
};

// 게임 ID별 아이콘 매핑
export const GAME_ICONS: Record<string, React.ComponentType<GameIconProps>> = {
  sudoku: Grid3X3,
  'puzzle-2048': Layers,
  memory: Brain,
  minesweeper: Bomb,
  wordle: Type,
  'sliding-puzzle': LayoutGrid,
  typing: Keyboard,
  reaction: Zap,
  baseball: Target,
  flappy: Bird,
  snake: SnakeIcon,
  breakout: BrickIcon,
  'color-match': Palette,
};

type Props = {
  gameId: string;
  size?: number;
  className?: string;
};

export default function GameIcon({ gameId, size = 24, className = '' }: Props) {
  const IconComponent = GAME_ICONS[gameId];

  if (!IconComponent) {
    return <Gamepad2 size={size} className={className} />;
  }

  return <IconComponent size={size} className={className} />;
}
