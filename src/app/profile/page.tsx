'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalUser, LocalUser } from '@/lib/auth';
import { getCountryByCode, DEFAULT_COUNTRY_CODE } from '@/lib/data/countries';
import { getUserPoints } from '@/lib/mission';
import { getLevelInfo, LevelInfo, LEVEL_CONFIG } from '@/lib/level';
import { getAchievementsWithStatus, RARITY_COLORS, RARITY_LABELS, claimAchievementReward } from '@/lib/achievements';
import { getStatsSummary, getPlayedGames, formatPlayTime } from '@/lib/stats';
import { getAttendanceStats } from '@/lib/attendance';
import { ChevronLeft, Gift, Trophy, Target, Clock, Gamepad2, Star, Award } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [points, setPoints] = useState(0);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');
  const [mounted, setMounted] = useState(false);

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

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <div className="px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-white/80 hover:text-white">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-lg font-bold">프로필</h1>
            <div className="w-6" />
          </div>

          {/* 프로필 카드 */}
          <div className="px-4 pb-6 pt-2">
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            <div className="relative">
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
                <span className="text-xl">
                  {getCountryByCode(user.country || DEFAULT_COUNTRY_CODE)?.flag}
                </span>
                <h2 className="text-xl font-bold">{user.nickname}</h2>
              </div>
              {levelInfo && (
                <div className="flex items-center gap-2">
                  <span className="text-white/80">Lv.{levelInfo.level}</span>
                  <span className="text-white/60">·</span>
                  <span className="text-white/80">{levelInfo.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* 레벨 진행도 */}
          {levelInfo && !levelInfo.isMaxLevel && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Lv.{levelInfo.level}</span>
                <span>Lv.{levelInfo.level + 1}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
              <p className="text-xs text-white/60 mt-1 text-center">
                다음 레벨까지 {(levelInfo.nextLevelExp - levelInfo.currentExp).toLocaleString()}P
              </p>
            </div>
          )}

          {/* 포인트 */}
          <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift size={20} className="text-yellow-300" />
              <span>보유 포인트</span>
            </div>
            <span className="text-xl font-bold">{points.toLocaleString()}P</span>
          </div>
        </div>
        </div>

        {/* 탭 */}
        <div className="bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'stats'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            통계
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
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
        <div className="p-4">
          {activeTab === 'stats' ? <StatsTab /> : <AchievementsTab onClaim={loadData} />}
        </div>
      </div>
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
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Gamepad2 size={20} className="text-blue-500" />}
          label="총 플레이"
          value={`${summary.totalPlays}회`}
        />
        <StatCard
          icon={<Trophy size={20} className="text-yellow-500" />}
          label="총 점수"
          value={summary.totalScore.toLocaleString()}
        />
        <StatCard
          icon={<Clock size={20} className="text-green-500" />}
          label="플레이 시간"
          value={formatPlayTime(summary.totalTimeMinutes)}
        />
        <StatCard
          icon={<Target size={20} className="text-red-500" />}
          label="승률"
          value={`${summary.winRate}%`}
        />
      </div>

      {/* 출석 통계 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Star size={18} className="text-orange-500" />
          출석 현황
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {attendance.totalDays}
            </p>
            <p className="text-xs text-gray-500">총 출석</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-500">
              {attendance.currentStreak}
            </p>
            <p className="text-xs text-gray-500">연속 출석</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {attendance.thisMonthDays}
            </p>
            <p className="text-xs text-gray-500">이번 달</p>
          </div>
        </div>
      </div>

      {/* 즐겨찾는 게임 */}
      {summary.favoriteGame && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">최애 게임</h3>
          <p className="text-lg">{summary.favoriteGame.name}</p>
        </div>
      )}

      {/* 게임별 통계 */}
      {playedGames.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">게임별 기록</h3>
          <div className="space-y-3">
            {playedGames.slice(0, 5).map((game) => (
              <div
                key={game.gameType}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
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
              </div>
            ))}
          </div>
        </div>
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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

// 업적 탭
function AchievementsTab({ onClaim }: { onClaim: () => void }) {
  const achievements = getAchievementsWithStatus();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handleClaim = (id: string) => {
    const result = claimAchievementReward(id);
    if (result.success) {
      onClaim();
    }
  };

  return (
    <div className="space-y-4">
      {/* 진행도 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-gray-900 dark:text-white">업적 달성</span>
          <span className="text-blue-500 font-bold">
            {unlockedCount}/{achievements.length}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 업적 목록 */}
      <div className="space-y-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
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
              >
                {achievement.unlocked ? achievement.icon : '❓'}
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
                  >
                    {RARITY_LABELS[achievement.rarity]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-1 mt-1 text-yellow-500 text-sm">
                  <Gift size={14} />
                  <span>{achievement.reward}P</span>
                </div>
              </div>
              {achievement.unlocked && !achievement.claimed && (
                <button
                  onClick={() => handleClaim(achievement.id)}
                  className="px-3 py-1.5 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600"
                >
                  받기
                </button>
              )}
              {achievement.claimed && (
                <span className="text-green-500 text-sm font-medium">완료</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
