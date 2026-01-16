'use client';

import { memo, useCallback } from 'react';
import { GameCategory } from '@/lib/data/games';

type CategoryTabsProps = {
  categories: { id: GameCategory; name: string; icon: string }[];
  selected: GameCategory;
  onChange: (id: GameCategory) => void;
};

type TabButtonProps = {
  category: { id: GameCategory; name: string; icon: string };
  isSelected: boolean;
  onClick: () => void;
};

const TabButton = memo(function TabButton({ category, isSelected, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={isSelected}
      aria-label={`${category.name} 카테고리${isSelected ? ' (선택됨)' : ''}`}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-full
        whitespace-nowrap transition-all duration-200
        font-medium text-sm
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${
          isSelected
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }
      `}
    >
      <span className="text-base" aria-hidden="true">{category.icon}</span>
      <span>{category.name}</span>
    </button>
  );
});

function CategoryTabs({
  categories,
  selected,
  onChange,
}: CategoryTabsProps) {
  const handleClick = useCallback((id: GameCategory) => {
    onChange(id);
  }, [onChange]);

  return (
    <nav aria-label="게임 카테고리 필터">
      <div
        role="tablist"
        aria-label="게임 카테고리"
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6"
      >
        {categories.map((category) => (
          <TabButton
            key={category.id}
            category={category}
            isSelected={selected === category.id}
            onClick={() => handleClick(category.id)}
          />
        ))}
      </div>
    </nav>
  );
}

export default memo(CategoryTabs);
