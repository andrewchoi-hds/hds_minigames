'use client';

import { memo } from 'react';
import { GameType, RankingEntry } from '@/lib/supabase';
import { getCountryByCode, DEFAULT_COUNTRY_CODE } from '@/lib/data/countries';
import { MiniRankingSkeleton } from '@/components/ui/Skeleton';
import { useMiniRanking } from '@/hooks/useRanking';

type Props = {
  gameType: GameType;
  difficulty?: string;
};

// 컴포넌트 외부로 분리 (재생성 방지)
const getRankIcon = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return rank.toString();
};

// 랭킹 행 컴포넌트 (memo로 최적화)
const RankingItem = memo(function RankingItem({ entry }: { entry: RankingEntry }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-lg w-6 text-center">{getRankIcon(entry.rank)}</span>
      <span className="text-base">
        {getCountryByCode(entry.country || DEFAULT_COUNTRY_CODE)?.flag}
      </span>
      <span className="flex-1 font-medium text-gray-900 dark:text-white truncate">
        {entry.nickname}
      </span>
      <span className="font-mono font-bold text-blue-500">
        {entry.score.toLocaleString()}
      </span>
    </div>
  );
});

function MiniRanking({ gameType, difficulty }: Props) {
  // SWR 훅 사용
  const { ranking, isLoading } = useMiniRanking(gameType, difficulty);

  if (isLoading) {
    return <MiniRankingSkeleton />;
  }

  if (ranking.length === 0) {
    return (
      <div className="text-center py-3 text-sm text-gray-500 dark:text-gray-400">
        아직 기록이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ranking.map((entry) => (
        <RankingItem key={entry.user_id} entry={entry} />
      ))}
    </div>
  );
}

export default memo(MiniRanking);
