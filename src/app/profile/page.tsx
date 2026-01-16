'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalUser, updateLocalUser, LocalUser } from '@/lib/auth';
import { getCountryByCode, DEFAULT_COUNTRY_CODE } from '@/lib/data/countries';
import CountrySelectModal from '@/components/country/CountrySelectModal';
import { getUserPoints } from '@/lib/mission';
import { getLevelInfo, LevelInfo, LEVEL_CONFIG } from '@/lib/level';
import { getAchievementsWithStatus, RARITY_COLORS, RARITY_LABELS, claimAchievementReward } from '@/lib/achievements';
import { getStatsSummary, getPlayedGames, formatPlayTime } from '@/lib/stats';
import { getAttendanceStats } from '@/lib/attendance';
import { ChevronLeft, Gift, Trophy, Target, Clock, Gamepad2, Star, Award, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [points, setPoints] = useState(0);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');
  const [mounted, setMounted] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = () => {
    setUser(getLocalUser());
    const pts = getUserPoints();
    setPoints(pts);
    setLevelInfo(getLevelInfo(pts));
  };

  const handleSelectCountry = (countryCode: string) => {
    updateLocalUser({ country: countryCode });
    setUser((prev) => (prev ? { ...prev, country: countryCode } : null));
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-lg mx-auto px-4">
        {/* 헤더 */}
        <header className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl mt-4 shadow-lg">
          <nav className="px-4 py-3 flex items-center justify-between" aria-label="프로필 페이지 네비게이션">
            <Link href="/" aria-label="홈으로 돌아가기" className="text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-500 rounded-lg p-1">
              <ChevronLeft size={24} aria-hidden="true" />
            </Link>
            <h1 className="text-lg font-bold">프로필</h1>
            <div className="w-6" aria-hidden="true" />
          </nav>

          {/* 프로필 카드 */}
          <div className="px-4 pb-4">
            <section aria-label="프로필 정보" className="flex items-center gap-4">
              {/* 아바타 */}
              <div className="relative" aria-hidden="true">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-bold">
                  {user.nickname[0].toUpperCase()}
                </div>
                {levelInfo && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-lg shadow-lg">
                    {levelInfo.icon}
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => setIsCountryModalOpen(true)}
                    aria-label={`국가 변경 (현재: ${getCountryByCode(user.country || DEFAULT_COUNTRY_CODE)?.name})`}
                    className="flex items-center gap-1 text-xl hover:bg-white/10 rounded-lg px-1.5 py-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-500"
                  >
                    <span aria-hidden="true">{getCountryByCode(user.country || DEFAULT_COUNTRY_CODE)?.flag}</span>
                    <ChevronRight size={14} className="text-white/60" aria-hidden="true" />
                  </button>
                  <h2 className="text-xl font-bold">{user.nickname}</h2>
                </div>
                {levelInfo && (
                  <div className="flex items-center gap-2" aria-label={`레벨 ${levelInfo.level}, 칭호: ${levelInfo.title}`}>
                    <span className="text-white/80">Lv.{levelInfo.level}</span>
                    <span className="text-white/60" aria-hidden="true">·</span>
                    <span className="text-white/80">{levelInfo.title}</span>
                  </div>
                )}
              </div>
            </section>

            {/* 레벨 진행도 */}
            {levelInfo && !levelInfo.isMaxLevel && (
              <section aria-label="레벨 진행도" className="mt-4">
                <div className="flex justify-between text-xs text-white/70 mb-1" aria-hidden="true">
                  <span>Lv.{levelInfo.level}</span>
                  <span>Lv.{levelInfo.level + 1}</span>
                </div>
                <div
                  className="h-2 bg-white/20 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={Math.round(levelInfo.progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`레벨 진행도: ${Math.round(levelInfo.progress)}%`}
                >
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${levelInfo.progress}%` }}
                  />
                </div>
                <p className="text-xs text-white/60 mt-1 text-center">
                  다음 레벨까지 {(levelInfo.nextLevelExp - levelInfo.currentExp).toLocaleString()}P
                </p>
              </section>
            )}

            {/* 포인트 */}
            <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center justify-between" aria-label={`보유 포인트: ${points.toLocaleString()} 포인트`}>
              <div className="flex items-center gap-2">
                <Gift size={20} className="text-yellow-300" aria-hidden="true" />
                <span>보유 포인트</span>
              </div>
              <span className="text-xl font-bold">{points.toLocaleString()}P</span>
            </div>
          </div>
        </header>

        <main>
          {/* 탭 */}
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl mt-4 shadow-sm">
            <div role="tablist" aria-label="프로필 탭 선택" className="flex gap-2">
              <button
                role="tab"
                aria-selected={activeTab === 'stats'}
                aria-controls="profile-panel"
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  activeTab === 'stats'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                통계
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'achievements'}
                aria-controls="profile-panel"
                onClick={() => setActiveTab('achievements')}
                className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  activeTab === 'achievements'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                업적
              </button>
            </div>
          </div>

          {/* 콘텐츠 */}
          <section id="profile-panel" role="tabpanel" aria-label={activeTab === 'stats' ? '통계' : '업적'} className="py-4">
            {activeTab === 'stats' ? <StatsTab /> : <AchievementsTab onClaim={loadData} />}
          </section>
        </main>
      </div>

      {/* 국가 선택 모달 */}
      <CountrySelectModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        onSelect={handleSelectCountry}
        selectedCountry={user.country || DEFAULT_COUNTRY_CODE}
      />
    </div>
  );
}

// 통계 탭
function StatsTab() {
  const summary = getStatsSummary();
  const playedGames = getPlayedGames();
  const attendance = getAttendanceStats();

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <section aria-label="게임 통계 요약" className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Gamepad2 size={20} className="text-blue-500" aria-hidden="true" />}
          label="총 플레이"
          value={`${summary.totalPlays}회`}
        />
        <StatCard
          icon={<Trophy size={20} className="text-yellow-500" aria-hidden="true" />}
          label="총 점수"
          value={summary.totalScore.toLocaleString()}
        />
        <StatCard
          icon={<Clock size={20} className="text-green-500" aria-hidden="true" />}
          label="플레이 시간"
          value={formatPlayTime(summary.totalTimeMinutes)}
        />
        <StatCard
          icon={<Target size={20} className="text-red-500" aria-hidden="true" />}
          label="승률"
          value={`${summary.winRate}%`}
        />
      </section>

      {/* 출석 통계 */}
      <section aria-label="출석 현황" className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Star size={18} className="text-orange-500" aria-hidden="true" />
          출석 현황
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div aria-label={`총 출석 ${attendance.totalDays}일`}>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {attendance.totalDays}
            </p>
            <p className="text-xs text-gray-500">총 출석</p>
          </div>
          <div aria-label={`연속 출석 ${attendance.currentStreak}일`}>
            <p className="text-2xl font-bold text-orange-500">
              {attendance.currentStreak}
            </p>
            <p className="text-xs text-gray-500">연속 출석</p>
          </div>
          <div aria-label={`이번 달 ${attendance.thisMonthDays}일`}>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {attendance.thisMonthDays}
            </p>
            <p className="text-xs text-gray-500">이번 달</p>
          </div>
        </div>
      </section>

      {/* 즐겨찾는 게임 */}
      {summary.favoriteGame && (
        <section aria-label="최애 게임" className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">최애 게임</h3>
          <p className="text-lg">{summary.favoriteGame.name}</p>
        </section>
      )}

      {/* 게임별 통계 */}
      {playedGames.length > 0 && (
        <section aria-label="게임별 기록" className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">게임별 기록</h3>
          <ul className="space-y-3" role="list">
            {playedGames.slice(0, 5).map((game) => (
              <li
                key={game.gameType}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                aria-label={`${game.name}: 최고 점수 ${game.stats.bestScore.toLocaleString()}점, ${game.stats.playCount}회 플레이`}
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {game.name}
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-500">
                    {game.stats.bestScore.toLocaleString()}점
                  </p>
                  <p className="text-xs text-gray-500">
                    {game.stats.playCount}회 플레이
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// 통계 카드
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm" aria-label={`${label}: ${value}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </article>
  );
}

// 업적 탭
function AchievementsTab({ onClaim }: { onClaim: () => void }) {
  const achievements = getAchievementsWithStatus();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progressPercent = (unlockedCount / achievements.length) * 100;

  const handleClaim = (id: string) => {
    const result = claimAchievementReward(id);
    if (result.success) {
      onClaim();
    }
  };

  return (
    <div className="space-y-4">
      {/* 진행도 */}
      <section aria-label="업적 진행도" className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-gray-900 dark:text-white">업적 달성</span>
          <span className="text-blue-500 font-bold" aria-live="polite">
            {unlockedCount}/{achievements.length}
          </span>
        </div>
        <div
          className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={unlockedCount}
          aria-valuemin={0}
          aria-valuemax={achievements.length}
          aria-label={`업적 달성 진행도: ${unlockedCount}/${achievements.length}`}
        >
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* 업적 목록 */}
      <section aria-label="업적 목록">
        <ul className="space-y-3" role="list">
          {achievements.map((achievement) => {
            const statusText = achievement.claimed
              ? '보상 수령 완료'
              : achievement.unlocked
              ? '달성, 보상 수령 가능'
              : '미달성';
            return (
              <li key={achievement.id}>
                <article
                  aria-label={`${achievement.name} - ${RARITY_LABELS[achievement.rarity]} - ${statusText}`}
                  className={`
                    bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm
                    ${!achievement.unlocked ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                        bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}
                      `}
                      aria-hidden="true"
                    >
                      {achievement.unlocked ? achievement.icon : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {achievement.name}
                        </h3>
                        <span
                          className={`
                            text-[10px] px-1.5 py-0.5 rounded font-medium
                            bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white
                          `}
                          aria-label={`희귀도: ${RARITY_LABELS[achievement.rarity]}`}
                        >
                          {RARITY_LABELS[achievement.rarity]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-yellow-500 text-sm" aria-label={`보상: ${achievement.reward} 포인트`}>
                        <Gift size={14} aria-hidden="true" />
                        <span>{achievement.reward}P</span>
                      </div>
                    </div>
                    {achievement.unlocked && !achievement.claimed && (
                      <button
                        onClick={() => handleClaim(achievement.id)}
                        aria-label={`${achievement.name} 업적 보상 ${achievement.reward} 포인트 받기`}
                        className="px-3 py-1.5 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      >
                        받기
                      </button>
                    )}
                    {achievement.claimed && (
                      <span className="text-green-500 text-sm font-medium" aria-label="보상 수령 완료">완료</span>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
