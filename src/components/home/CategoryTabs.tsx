'use client';

import { GameCategory } from '@/lib/data/games';

type CategoryTabsProps = {
  categories: { id: GameCategory; name: string; icon: string }[];
  selected: GameCategory;
  onChange: (id: GameCategory) => void;
};

export default function CategoryTabs({
  categories,
  selected,
  onChange,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-full
            whitespace-nowrap transition-all duration-200
            font-medium text-sm
            ${
              selected === category.id
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
        >
          <span className="text-base">{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
