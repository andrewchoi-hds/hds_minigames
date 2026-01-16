'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getLocalUser, logout, LocalUser } from '@/lib/auth';
import { getCountryByCode, DEFAULT_COUNTRY_CODE } from '@/lib/data/countries';
import NicknameSetup from '@/components/NicknameSetup';
import { CategoryTabs, GameCard, GameSection, HeroBanner } from '@/components/home';
import { MissionWidget } from '@/components/mission';
import { AttendanceWidget } from '@/components/attendance';
import { InviteButton } from '@/components/share';
import {
  GameCategory,
  GAME_CATEGORIES,
  GAMES,
  getPopularGames,
  getNewGames,
  getGamesByCategory,
} from '@/lib/data/games';

export default function Home() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');

  useEffect(() => {
    const localUser = getLocalUser();
    setUser(localUser);
    setIsLoading(false);
  }, []);

  // 필터링된 게임 목록
  const filteredGames = useMemo(
    () => getGamesByCategory(selectedCategory),
    [selectedCategory]
  );

  // 인기 게임
  const popularGames = useMemo(() => getPopularGames(), []);

  // 새로운 게임
  const newGames = useMemo(() => getNewGames(), []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 상단 헤더 */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mini Games
          </h1>
          <nav className="flex items-center gap-2" aria-label="사용자 메뉴">
            <Link
              href="/profile"
              aria-label={`${user.nickname} 프로필 보기`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-full"
            >
              <span className="text-lg" aria-hidden="true">
                {getCountryByCode(user.country || DEFAULT_COUNTRY_CODE)?.flag}
              </span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
                {user.nickname[0].toUpperCase()}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              aria-label="로그아웃"
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1"
            >
              로그아웃
            </button>
          </nav>
        </header>

        <main>
          {/* 히어로 배너 */}
          <HeroBanner />

          {/* 출석 체크 & 미션 */}
          <section aria-label="출석 및 미션" className="space-y-4 mb-6">
            <AttendanceWidget />
            <MissionWidget />
          </section>

          {/* 카테고리 탭 */}
          <CategoryTabs
            categories={GAME_CATEGORIES}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />

          {/* 전체 탭일 때 */}
          {selectedCategory === 'all' && (
            <>
              {/* 인기 게임 섹션 */}
              <GameSection title="인기 게임" icon="🔥">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700" role="list" aria-label="인기 게임 목록">
                  {popularGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </GameSection>

              {/* 새로운 게임 섹션 */}
              {newGames.length > 0 && (
                <GameSection title="새로운 게임" icon="✨">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700" role="list" aria-label="새로운 게임 목록">
                    {newGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                </GameSection>
              )}

              {/* 전체 게임 섹션 */}
              <GameSection title="전체 게임" icon="🎮">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700" role="list" aria-label="전체 게임 목록">
                  {GAMES.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </GameSection>
            </>
          )}

          {/* 카테고리 선택 시 */}
          {selectedCategory !== 'all' && (
            <GameSection
              title={`${GAME_CATEGORIES.find((c) => c.id === selectedCategory)?.name} 게임`}
              icon={GAME_CATEGORIES.find((c) => c.id === selectedCategory)?.icon}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700" role="list" aria-label={`${GAME_CATEGORIES.find((c) => c.id === selectedCategory)?.name} 게임 목록`}>
                {filteredGames.length > 0 ? (
                  filteredGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500" role="status">
                    이 카테고리에 게임이 없습니다.
                  </div>
                )}
              </div>
            </GameSection>
          )}

          {/* 하단 버튼들 */}
          <nav aria-label="추가 기능" className="mt-6 space-y-3">
            <Link
              href="/ranking"
              aria-label="전체 랭킹 페이지로 이동"
              className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
            >
              <span className="text-xl" aria-hidden="true">🏆</span>
              <span>전체 랭킹 보기</span>
            </Link>

            {/* 친구 초대 */}
            <InviteButton variant="card" />
          </nav>
        </main>
      </div>
    </div>
  );
}
