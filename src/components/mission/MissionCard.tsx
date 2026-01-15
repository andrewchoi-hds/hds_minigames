'use client';

import { Mission, UserMission } from '@/lib/data/missions';
import { claimMissionReward } from '@/lib/mission';
import { useState } from 'react';
import { Gift, Check, ChevronRight } from 'lucide-react';

type Props = {
  mission: Mission;
  userProgress: UserMission | null;
  onClaim?: (points: number) => void;
};

export default function MissionCard({ mission, userProgress, onClaim }: Props) {
  const [claiming, setClaiming] = useState(false);

  const progress = userProgress?.progress || 0;
  const completed = userProgress?.completed || false;
  const claimed = !!userProgress?.claimedAt;
  const progressPercent = Math.min(100, (progress / mission.targetValue) * 100);

  const handleClaim = async () => {
    if (!completed || claimed || claiming) return;

    setClaiming(true);
    const result = claimMissionReward(mission.id);

    if (result.success && result.points !== undefined) {
      onClaim?.(result.points);
    }

    setClaiming(false);
  };

  return (
    <div
      className={`
        relative p-4 rounded-xl border transition-all
        ${claimed
          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
          : completed
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
            ${completed
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-gray-100 dark:bg-gray-700'
            }
          `}
        >
          {mission.icon}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              {mission.title}
            </h3>
            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <Gift size={12} />
              {mission.rewardPoints}P
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {mission.description}
          </p>

          {/* 진행도 바 */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  completed ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-16 text-right">
              {progress >= mission.targetValue
                ? 'DONE'
                : `${progress}/${mission.targetValue}`}
            </span>
          </div>
        </div>

        {/* 보상 버튼 */}
        {completed && !claimed && (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-bold
              bg-green-500 text-white
              hover:bg-green-600 active:scale-95
              transition-all flex-shrink-0
              ${claiming ? 'opacity-50' : ''}
            `}
          >
            {claiming ? '...' : '받기'}
          </button>
        )}

        {claimed && (
          <div className="flex items-center gap-1 text-green-500 flex-shrink-0">
            <Check size={16} />
            <span className="text-xs font-medium">완료</span>
          </div>
        )}
      </div>
    </div>
  );
}
