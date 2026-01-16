'use client';

import useSWR from 'swr';
import { getRanking, getMyRank, Period } from '@/lib/ranking';
import { GameType, RankingEntry } from '@/lib/supabase';
import { getLocalUser } from '@/lib/auth';

// SWR 키 생성 함수
export function getRankingKey(params: {
  gameType: GameType;
  difficulty?: string;
  period?: Period;
  limit?: number;
}) {
  return `ranking-${params.gameType}-${params.difficulty || 'default'}-${params.period || 'all'}-${params.limit || 100}`;
}

export function getMyRankKey(params: {
  gameType: GameType;
  difficulty?: string;
  period?: Period;
  userId?: string;
}) {
  if (!params.userId) return null;
  return `myrank-${params.gameType}-${params.difficulty || 'default'}-${params.period || 'all'}-${params.userId}`;
}

// 랭킹 데이터 fetcher
async function fetchRanking(params: {
  gameType: GameType;
  difficulty?: string;
  period?: Period;
  limit?: number;
}): Promise<RankingEntry[]> {
  const result = await getRanking({
    gameType: params.gameType,
    difficulty: params.difficulty,
    period: params.period || 'all',
    limit: params.limit || 100,
  });

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data;
}

// 내 순위 fetcher
async function fetchMyRank(params: {
  gameType: GameType;
  difficulty?: string;
  period?: Period;
}): Promise<number> {
  return await getMyRank({
    gameType: params.gameType,
    difficulty: params.difficulty,
    period: params.period || 'all',
  });
}

// 랭킹 훅 옵션
type UseRankingOptions = {
  gameType: GameType;
  difficulty?: string;
  period?: Period;
  limit?: number;
  // SWR 옵션
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
};

// 랭킹 데이터 훅
export function useRanking({
  gameType,
  difficulty,
  period = 'all',
  limit = 100,
  refreshInterval = 0,
  revalidateOnFocus = true,
}: UseRankingOptions) {
  const currentUser = getLocalUser();

  // 랭킹 데이터 SWR
  const {
    data: ranking,
    error: rankingError,
    isLoading: isLoadingRanking,
    mutate: mutateRanking,
  } = useSWR(
    getRankingKey({ gameType, difficulty, period, limit }),
    () => fetchRanking({ gameType, difficulty, period, limit }),
    {
      refreshInterval,
      revalidateOnFocus,
      dedupingInterval: 5000, // 5초 내 중복 요청 방지
      errorRetryCount: 3,
    }
  );

  // 내 순위 SWR
  const {
    data: myRank,
    isLoading: isLoadingMyRank,
    mutate: mutateMyRank,
  } = useSWR(
    getMyRankKey({ gameType, difficulty, period, userId: currentUser?.id }),
    () => fetchMyRank({ gameType, difficulty, period }),
    {
      refreshInterval,
      revalidateOnFocus,
      dedupingInterval: 5000,
    }
  );

  // 수동 새로고침
  const refresh = async () => {
    await Promise.all([
      mutateRanking(),
      currentUser ? mutateMyRank() : Promise.resolve(),
    ]);
  };

  return {
    ranking: ranking || [],
    myRank: myRank || 0,
    isLoading: isLoadingRanking || isLoadingMyRank,
    error: rankingError?.message || '',
    refresh,
    currentUser,
  };
}

// 미니 랭킹용 훅 (Top 3만)
export function useMiniRanking(gameType: GameType, difficulty?: string) {
  const {
    data: ranking,
    isLoading,
  } = useSWR(
    getRankingKey({ gameType, difficulty, period: 'all', limit: 3 }),
    () => fetchRanking({ gameType, difficulty, period: 'all', limit: 3 }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10초 내 중복 요청 방지
      errorRetryCount: 2,
    }
  );

  return {
    ranking: ranking || [],
    isLoading,
  };
}
