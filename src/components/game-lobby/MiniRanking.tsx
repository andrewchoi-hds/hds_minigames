'use client';

import { useState, useEffect } from 'react';
import { getRanking } from '@/lib/ranking';
import { GameType, RankingEntry } from '@/lib/supabase';
import { getCountryByCode, DEFAULT_COUNTRY_CODE } from '@/lib/data/countries';

type Props = {
  gameType: GameType;
  difficulty?: string;
};

export default function MiniRanking({ gameType, difficulty }: Props) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, [gameType, difficulty]);

  const loadRanking = async () => {
    setIsLoading(true);
    const result = await getRanking({
      gameType,
      difficulty,
      period: 'all',
      limit: 3,
    });
    setRanking(result.data);
    setIsLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
        <div
          key={entry.user_id}
          className="flex items-center gap-3 py-1"
        >
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
      ))}
    </div>
  );
}
