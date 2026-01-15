'use client';

import { ReactNode } from 'react';

type GameSectionProps = {
  title: string;
  icon?: string;
  showMore?: boolean;
  onMoreClick?: () => void;
  children: ReactNode;
};

export default function GameSection({
  title,
  icon,
  showMore,
  onMoreClick,
  children,
}: GameSectionProps) {
  return (
    <section className="mb-8">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </h2>
        {showMore && (
          <button
            onClick={onMoreClick}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
          >
            <span>더보기</span>
            <svg
              className="w-4 h-4"
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
          </button>
        )}
      </div>

      {/* 콘텐츠 */}
      {children}
    </section>
  );
}
