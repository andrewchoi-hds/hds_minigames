'use client';

import Link from 'next/link';
import ColorMatchGame from '@/components/games/color-match/ColorMatchGame';

export default function ColorMatchPage() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            ← 홈
          </Link>
          <h1 className="text-xl font-bold">🎨 색상 맞추기</h1>
          <div className="w-12" />
        </div>

        <ColorMatchGame />
      </div>
    </main>
  );
}
