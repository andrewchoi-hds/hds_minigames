'use client';

import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { GAMES } from '@/lib/data/games';

type GamePlayLayoutProps = {
  gameId: string;
  title: string;
  icon: string;
  onBack: () => void;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
};

export default function GamePlayLayout({
  gameId,
  title,
  icon,
  onBack,
  children,
  maxWidth = 'lg',
}: GamePlayLayoutProps) {
  const game = GAMES.find((g) => g.id === gameId);
  const gradient = game?.gradient || 'from-blue-500 to-indigo-600';

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* 상단 헤더 - 게임 테마 컬러 적용 */}
      <div className={`${maxWidthClass} mx-auto w-full`}>
        <div className={`bg-gradient-to-r ${gradient} mx-4 mt-4 rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg`}>
          <button
            onClick={onBack}
            className="flex items-center text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{icon}</span>
            <span>{title}</span>
          </h1>
          <div className="w-6" />
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className={`flex-1 ${maxWidthClass} mx-auto w-full px-4 py-4`}>
        {children}
      </div>
    </div>
  );
}
