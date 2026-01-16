'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { Mission, UserMission } from '@/lib/data/missions';
import { claimMissionReward } from '@/lib/mission';
import { Gift, Check } from 'lucide-react';

type Props = {
  mission: Mission;
  userProgress: UserMission | null;
  onClaim?: (points: number) => void;
};

function MissionCard({ mission, userProgress, onClaim }: Props) {
  const [claiming, setClaiming] = useState(false);

  const { progress, completed, claimed, progressPercent } = useMemo(() => {
    const prog = userProgress?.progress || 0;
    const comp = userProgress?.completed || false;
    const clm = !!userProgress?.claimedAt;
    const percent = Math.min(100, (prog / mission.targetValue) * 100);
    return { progress: prog, completed: comp, claimed: clm, progressPercent: percent };
  }, [userProgress, mission.targetValue]);

  const handleClaim = useCallback(async () => {
    if (!completed || claimed || claiming) return;

    setClaiming(true);
    const result = claimMissionReward(mission.id);

    if (result.success && result.points !== undefined) {
      onClaim?.(result.points);
    }

    setClaiming(false);
  }, [completed, claimed, claiming, mission.id, onClaim]);

  const statusText = claimed ? '보상 수령 완료' : completed ? '완료, 보상 수령 가능' : '진행 중';

  return (
    <article
      aria-label={`${mission.title} - ${statusText}`}
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
          aria-hidden="true"
        >
          {mission.icon}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              {mission.title}
            </h3>
            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-1" aria-label={`보상 ${mission.rewardPoints} 포인트`}>
              <Gift size={12} aria-hidden="true" />
              {mission.rewardPoints}P
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {mission.description}
          </p>

          {/* 진행도 바 */}
          <div className="flex items-center gap-2">
            <div
              className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={mission.targetValue}
              aria-label={`미션 진행도: ${progress}/${mission.targetValue}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  completed ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-16 text-right" aria-hidden="true">
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
            aria-label={`${mission.title} 보상 ${mission.rewardPoints} 포인트 받기`}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-bold
              bg-green-500 text-white
              hover:bg-green-600 active:scale-95
              transition-all flex-shrink-0
              focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2
              ${claiming ? 'opacity-50' : ''}
            `}
          >
            {claiming ? '...' : '받기'}
          </button>
        )}

        {claimed && (
          <div className="flex items-center gap-1 text-green-500 flex-shrink-0" aria-label="보상 수령 완료">
            <Check size={16} aria-hidden="true" />
            <span className="text-xs font-medium">완료</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(MissionCard);
