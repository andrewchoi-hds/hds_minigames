'use client';

import { cn } from '@/lib/utils';

type SkeletonProps = {
  className?: string;
};

// 기본 스켈레톤 (애니메이션 적용)
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
        className
      )}
    />
  );
}

// 텍스트 스켈레톤
export function TextSkeleton({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />;
}

// 아바타/원형 스켈레톤
export function CircleSkeleton({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} />;
}

// 카드 스켈레톤
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3', className)}>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// 게임 카드 스켈레톤
export function GameCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// 랭킹 행 스켈레톤
export function RankingRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Skeleton className="w-6 h-6 rounded" />
      <Skeleton className="w-6 h-6 rounded" />
      <Skeleton className="h-4 flex-1 max-w-[120px]" />
      <Skeleton className="h-4 w-16 ml-auto" />
    </div>
  );
}

// 랭킹 보드 스켈레톤
export function RankingBoardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-12 rounded-lg" />
            <Skeleton className="h-8 w-12 rounded-lg" />
            <Skeleton className="h-8 w-12 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <RankingRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// 미니 랭킹 스켈레톤
export function MiniRankingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 py-1">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-4 flex-1 max-w-[100px]" />
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  );
}

// 미션 카드 스켈레톤
export function MissionCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

// 프로필 스켈레톤
export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full rounded-full" />
    </div>
  );
}
