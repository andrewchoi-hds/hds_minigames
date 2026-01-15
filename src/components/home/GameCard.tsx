'use client';

import Link from 'next/link';
import { GameInfo } from '@/lib/data/games';
import { GameIcon } from '@/components/icons';

type GameCardProps = {
  game: GameInfo;
  variant?: 'list' | 'grid';
};

export default function GameCard({ game, variant = 'list' }: GameCardProps) {
  if (variant === 'grid') {
    return <GridCard game={game} />;
  }

  return <ListCard game={game} />;
}

// WON PLAY 스타일 리스트 카드
function ListCard({ game }: { game: GameInfo }) {
  return (
    <Link
      href={`/${game.id}`}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-xl group"
    >
      {/* 아이콘 영역 */}
      <div
        className={`
          w-14 h-14 rounded-2xl flex items-center justify-center
          bg-gradient-to-br ${game.gradient}
          shadow-lg group-hover:scale-105 transition-transform
          flex-shrink-0
        `}
      >
        <GameIcon gameId={game.id} size={28} className="text-white drop-shadow-md" />
      </div>

      {/* 텍스트 영역 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 dark:text-white">
            {game.name}
          </h3>
          {game.isNew && (
            <span className="px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded">
              NEW
            </span>
          )}
          {game.isPopular && !game.isNew && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
              HOT
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {game.description}
        </p>
      </div>

      {/* 화살표 */}
      <svg
        className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

// 그리드 카드 (필요시 사용)
function GridCard({ game }: { game: GameInfo }) {
  return (
    <Link
      href={`/${game.id}`}
      className="block rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 group"
    >
      <div
        className={`relative bg-gradient-to-br ${game.gradient} h-32 flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
            }}
          />
        </div>
        <GameIcon
          gameId={game.id}
          size={56}
          className="text-white transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
        />
        {game.isNew && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-lg">
            NEW
          </span>
        )}
        {game.isPopular && !game.isNew && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
            HOT
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">
          {game.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
          {game.description}
        </p>
      </div>
    </Link>
  );
}
