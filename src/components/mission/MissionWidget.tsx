'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMissionsWithStatus, getUserPoints, getUnclaimedMissionCount } from '@/lib/mission';
import { Mission, UserMission } from '@/lib/data/missions';
import { ChevronRight, Gift, Target } from 'lucide-react';

type MissionWithProgress = Mission & { userProgress: UserMission | null };

export default function MissionWidget() {
  const [missions, setMissions] = useState<{
    daily: MissionWithProgress[];
    weekly: MissionWithProgress[];
  }>({ daily: [], weekly: [] });
  const [points, setPoints] = useState(0);
  const [unclaimedCount, setUnclaimedCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = () => {
    const data = getMissionsWithStatus();
    setMissions(data);
    setPoints(getUserPoints());
    setUnclaimedCount(getUnclaimedMissionCount());
  };

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  // 완료 가능한 미션 수
  const completedDaily = missions.daily.filter((m) => m.userProgress?.completed).length;
  const totalDaily = missions.daily.length;

  // 다음에 완료할 미션 찾기
  const nextMission = missions.daily.find(
    (m) => !m.userProgress?.completed
  ) || missions.weekly.find((m) => !m.userProgress?.completed);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-gray-900 dark:text-white">오늘의 미션</span>
            {unclaimedCount > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                {unclaimedCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Gift size={16} />
            <span className="font-bold text-sm">{points.toLocaleString()}P</span>
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedDaily / totalDaily) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {completedDaily}/{totalDaily}
          </span>
        </div>
      </div>

      {/* 다음 미션 미리보기 */}
      {nextMission && (
        <Link
          href="/missions"
          className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
            {nextMission.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {nextMission.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {nextMission.userProgress
                ? `${nextMission.userProgress.progress}/${nextMission.targetValue}`
                : `0/${nextMission.targetValue}`}
              {' '}&middot;{' '}
              <span className="text-yellow-600 dark:text-yellow-400">
                +{nextMission.rewardPoints}P
              </span>
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      )}

      {/* 모든 미션 완료 */}
      {!nextMission && (
        <div className="p-4 text-center">
          <p className="text-green-500 font-medium">모든 미션 완료!</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            내일 새로운 미션이 열립니다
          </p>
        </div>
      )}
    </div>
  );
}
