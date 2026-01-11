'use client';

import Link from 'next/link';
import SnakeGame from '@/components/games/snake/SnakeGame';

export default function SnakePage() {
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
          <h1 className="text-xl font-bold">🐍 뱀 게임</h1>
          <div className="w-12" />
        </div>

        <SnakeGame />
      </div>
    </main>
  );
}
