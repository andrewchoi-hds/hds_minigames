'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMissionsWithStatus, getUserPoints, claimMissionReward } from '@/lib/mission';
import { Mission, UserMission } from '@/lib/data/missions';
import MissionCard from '@/components/mission/MissionCard';
import { Gift, ChevronLeft, Calendar, Target } from 'lucide-react';

type MissionWithProgress = Mission & { userProgress: UserMission | null };

export default function MissionsPage() {
  const [missions, setMissions] = useState<{
    daily: MissionWithProgress[];
    weekly: MissionWithProgress[];
  }>({ daily: [], weekly: [] });
  const [points, setPoints] = useState(0);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = () => {
    const data = getMissionsWithStatus();
    setMissions(data);
    setPoints(getUserPoints());
  };

  const handleClaim = (newPoints: number) => {
    setPoints(newPoints);
    loadData(); // 상태 새로고침
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentMissions = activeTab === 'daily' ? missions.daily : missions.weekly;
  const completedCount = currentMissions.filter((m) => m.userProgress?.completed).length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-lg mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl mt-4 shadow-lg">
          <div className="px-4 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold">미션</h1>
            <div className="w-5" />
          </div>

          {/* 포인트 */}
          <div className="px-4 pb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">내 포인트</p>
                  <p className="text-3xl font-bold">{points.toLocaleString()}P</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Gift size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl mt-4 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`
              flex-1 py-2 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2
              ${activeTab === 'daily'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}
          >
            <Target size={16} />
            일일 미션
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`
              flex-1 py-2 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2
              ${activeTab === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}
          >
            <Calendar size={16} />
            주간 미션
          </button>
        </div>
        </div>

        {/* 미션 목록 */}
        <div className="py-4">
        {/* 진행 상황 */}
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {activeTab === 'daily' ? '오늘' : '이번 주'} 미션 진행
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {completedCount}/{currentMissions.length} 완료
          </span>
        </div>

        {/* 미션 카드 목록 */}
        <div className="space-y-3">
          {currentMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              userProgress={mission.userProgress}
              onClaim={handleClaim}
            />
          ))}
        </div>

        {currentMissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              미션이 없습니다
            </p>
          </div>
        )}

        {/* 안내 */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>TIP:</strong>{' '}
            {activeTab === 'daily'
              ? '일일 미션은 매일 자정에 초기화됩니다.'
              : '주간 미션은 매주 월요일에 초기화됩니다.'}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
