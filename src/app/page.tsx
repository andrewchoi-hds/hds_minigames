'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalUser, logout, LocalUser } from '@/lib/auth';
import { getCountryByCode, DEFAULT_COUNTRY_CODE } from '@/lib/data/countries';
import NicknameSetup from '@/components/NicknameSetup';

const games = [
  {
    id: 'sudoku',
    name: '스도쿠',
    description: '숫자 퍼즐의 고전',
    emoji: '🔢',
  },
  {
    id: 'puzzle-2048',
    name: '2048',
    description: '숫자를 합쳐 2048을 만들어라',
    emoji: '🎯',
  },
  {
    id: 'memory',
    name: '메모리 게임',
    description: '카드 짝 맞추기',
    emoji: '🃏',
  },
  {
    id: 'minesweeper',
    name: '지뢰찾기',
    description: '지뢰를 피해 모든 칸을 열어라',
    emoji: '💣',
  },
  {
    id: 'wordle',
    name: '워들',
    description: '5글자 영단어 맞추기',
    emoji: '📝',
  },
  {
    id: 'sliding-puzzle',
    name: '슬라이딩 퍼즐',
    description: '숫자를 순서대로 정렬하세요',
    emoji: '🧩',
  },
  {
    id: 'typing',
    name: '타이핑 게임',
    description: '떨어지는 단어를 빠르게 타이핑',
    emoji: '⌨️',
  },
  {
    id: 'reaction',
    name: '반응속도 테스트',
    description: '당신의 반응속도를 측정하세요',
    emoji: '⚡',
  },
  {
    id: 'baseball',
    name: '숫자 야구',
    description: '숫자를 추리하여 정답을 맞추세요',
    emoji: '⚾',
  },
  {
    id: 'flappy',
    name: '플래피 버드',
    description: '파이프 사이를 날아서 통과하세요',
    emoji: '🐦',
  },
  {
    id: 'snake',
    name: '뱀 게임',
    description: '사과를 먹으며 뱀을 키우세요',
    emoji: '🐍',
  },
  {
    id: 'breakout',
    name: '벽돌깨기',
    description: '공을 튕겨 벽돌을 모두 깨세요',
    emoji: '🧱',
  },
  {
    id: 'color-match',
    name: '색상 맞추기',
    description: '스트룹 효과를 경험해보세요',
    emoji: '🎨',
  },
];

export default function Home() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const localUser = getLocalUser();
    setUser(localUser);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // 닉네임 설정 필요
  if (!user) {
    return <NicknameSetup onComplete={(newUser) => setUser(newUser)} />;
  }

  // 메인 화면
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* 상단 유저 정보 */}
        <div className="flex justify-end items-center mb-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getCountryByCode(user.country || DEFAULT_COUNTRY_CODE)?.flag}</span>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user.nickname[0].toUpperCase()}
            </div>
            <span className="font-medium">{user.nickname}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            로그아웃
          </button>
        </div>

        <h1 className="text-4xl font-bold text-center mb-2">Mini Games</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          가볍게 즐기는 미니게임 플랫폼
        </p>

        {/* 랭킹 링크 */}
        <div className="flex justify-center mb-8">
          <Link
            href="/ranking"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            🏆 랭킹 보기
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/${game.id}`}
              className="block p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all border border-gray-200 dark:border-gray-700"
            >
              <div className="text-3xl mb-2">{game.emoji}</div>
              <h2 className="text-lg font-semibold mb-1">{game.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{game.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
