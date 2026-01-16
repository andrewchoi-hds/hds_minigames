'use client';

import { useState, memo } from 'react';
import { Period } from '@/lib/ranking';
import { GameType, GAME_NAMES, RankingEntry } from '@/lib/supabase';
import { getCountryByCode, DEFAULT_COUNTRY_CODE } from '@/lib/data/countries';
import { RankingRowSkeleton } from '@/components/ui/Skeleton';
import { useRanking } from '@/hooks/useRanking';

type Props = {
  gameType: GameType;
  difficulty?: string;
  showPeriodFilter?: boolean;
  limit?: number;
};

const PERIOD_LABELS: Record<Period, string> = {
  daily: '일간',
  weekly: '주간',
  all: '전체',
};

// 유틸 함수들 (컴포넌트 외부로 분리하여 재생성 방지)
const formatTime = (seconds: number | null) => {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return rank.toString();
};

// 랭킹 행 컴포넌트 (memo로 최적화)
type RankingRowProps = {
  entry: RankingEntry;
  isMe: boolean;
};

const RankingRow = memo(function RankingRow({ entry, isMe }: RankingRowProps) {
  return (
    <tr
      className={`${
        isMe ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      } hover:bg-gray-50 dark:hover:bg-gray-700/30`}
    >
      <td className="px-4 py-3 font-medium">
        <span className={entry.rank <= 3 ? 'text-xl' : ''}>
          {getRankIcon(entry.rank)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`flex items-center gap-2 ${isMe ? 'font-bold text-blue-500' : ''}`}>
          <span className="text-lg">{getCountryByCode(entry.country || DEFAULT_COUNTRY_CODE)?.flag}</span>
          {entry.nickname}
          {isMe && ' (나)'}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-mono font-bold">
        {entry.score.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right font-mono text-gray-500">
        {formatTime(entry.time_seconds)}
      </td>
    </tr>
  );
});

export default function RankingBoard({
  gameType,
  difficulty,
  showPeriodFilter = true,
  limit = 100,
}: Props) {
  const [period, setPeriod] = useState<Period>('all');

  // SWR 훅 사용
  const { ranking, myRank, isLoading, error, refresh, currentUser } = useRanking({
    gameType,
    difficulty,
    period,
    limit,
    revalidateOnFocus: true,
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            🏆 {GAME_NAMES[gameType]} 랭킹
            {difficulty && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                - {difficulty}
              </span>
            )}
          </h2>

          {showPeriodFilter && (
            <div className="flex gap-1">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    period === p
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <RankingRowSkeleton key={i} />
          ))}
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="p-4 text-center text-red-500">
          {error}
          <button
            onClick={refresh}
            className="block mx-auto mt-2 text-sm text-blue-500 hover:underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 랭킹 테이블 */}
      {!isLoading && !error && (
        <>
          {ranking.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              아직 기록이 없습니다
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-sm">
                  <tr>
                    <th className="px-4 py-3 text-left">순위</th>
                    <th className="px-4 py-3 text-left">닉네임</th>
                    <th className="px-4 py-3 text-right">점수</th>
                    <th className="px-4 py-3 text-right">시간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {ranking.map((entry) => (
                    <RankingRow
                      key={entry.user_id}
                      entry={entry}
                      isMe={!!(currentUser && entry.user_id === currentUser.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 내 순위 */}
          {currentUser && myRank > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <div className="text-center">
                <span className="text-gray-500 dark:text-gray-400">내 순위: </span>
                <span className="font-bold text-lg text-blue-500">{myRank}위</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
