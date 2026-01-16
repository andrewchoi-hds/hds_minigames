'use client';

import { useState, useEffect, useRef } from 'react';
import { GameType, GAME_NAMES } from '@/lib/supabase';
import { ShareButton } from '@/components/share';
import { GameIcon } from '@/components/icons';
import { recordGamePlay } from '@/lib/mission';
import { shareGameResultAsImage } from '@/lib/share';
import { Trophy, RotateCcw, Home, Star, Image, Download, Check } from 'lucide-react';
import Link from 'next/link';

type Props = {
  gameType: GameType;
  score: number;
  isWin?: boolean;
  stats?: Record<string, string | number>;  // 추가 통계 (시간, 이동 수 등)
  onRestart?: () => void;
  onClose?: () => void;
};

export default function GameResultModal({
  gameType,
  score,
  isWin = true,
  stats,
  onRestart,
  onClose,
}: Props) {
  const [missionResult, setMissionResult] = useState<{
    completedMissions: string[];
  } | null>(null);
  const [imageShareStatus, setImageShareStatus] = useState<'idle' | 'loading' | 'shared' | 'downloaded'>('idle');
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 미션 진행 기록
    const result = recordGamePlay({
      gameType,
      score,
      won: isWin,
    });

    if (result.completedMissions.length > 0) {
      setMissionResult({
        completedMissions: result.completedMissions.map((m) => m.title),
      });
    }
  }, [gameType, score, isWin]);

  const gameName = GAME_NAMES[gameType] || gameType;

  // gameType을 gameId 형식으로 변환
  const getGameId = (type: GameType): string => {
    if (type === 'puzzle2048') return 'puzzle-2048';
    return type;
  };

  // 이미지로 공유하기
  const handleImageShare = async () => {
    if (!resultRef.current) return;

    setImageShareStatus('loading');

    const result = await shareGameResultAsImage(resultRef.current, {
      gameType,
      score,
    });

    if (result.success) {
      setImageShareStatus(result.method === 'share' ? 'shared' : 'downloaded');
      setTimeout(() => setImageShareStatus('idle'), 2000);
    } else {
      setImageShareStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        {/* 캡처 영역 */}
        <div ref={resultRef} className="bg-white dark:bg-gray-800 rounded-xl p-4">
          {/* 헤더 */}
          <div className="text-center mb-6">
            <div
              className={`
                w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center
                ${isWin
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }
              `}
            >
              {isWin ? (
                <Trophy size={40} className="text-white" />
              ) : (
                <GameIcon gameId={getGameId(gameType)} size={40} className="text-white" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {isWin ? '게임 클리어!' : '게임 오버'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">{gameName}</p>
          </div>

          {/* 점수 */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">최종 점수</p>
              <p className="text-4xl font-bold text-blue-500">{score.toLocaleString()}</p>
            </div>

            {/* 추가 통계 */}
            {stats && Object.keys(stats).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 grid grid-cols-2 gap-3">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{key}</p>
                    <p className="font-bold text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 미니 워터마크 (캡처용) */}
          <div className="text-center text-xs text-gray-400 dark:text-gray-500">
            minigames.vercel.app
          </div>
        </div>

        {/* 미션 완료 알림 */}
        {missionResult && missionResult.completedMissions.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Star size={16} />
              <span className="font-medium text-sm">미션 완료!</span>
            </div>
            <ul className="mt-1 text-sm text-green-700 dark:text-green-300">
              {missionResult.completedMissions.map((title, i) => (
                <li key={i}>• {title}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 공유 버튼 */}
        <div className="grid grid-cols-2 gap-2 mb-3 mt-4">
          <ShareButton
            data={{ gameType, score }}
            variant="full"
            className="!mb-0"
          />
          <button
            onClick={handleImageShare}
            disabled={imageShareStatus === 'loading'}
            className={`
              py-3 rounded-xl font-bold flex items-center justify-center gap-2
              bg-gradient-to-r from-green-500 to-emerald-500 text-white
              hover:shadow-lg active:scale-[0.98] transition-all
              disabled:opacity-50
            `}
          >
            {imageShareStatus === 'loading' ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>캡처 중...</span>
              </>
            ) : imageShareStatus === 'shared' ? (
              <>
                <Check size={20} />
                <span>공유됨!</span>
              </>
            ) : imageShareStatus === 'downloaded' ? (
              <>
                <Download size={20} />
                <span>저장됨!</span>
              </>
            ) : (
              <>
                <Image size={20} />
                <span>이미지 저장</span>
              </>
            )}
          </button>
        </div>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onRestart}
            className="py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RotateCcw size={18} />
            <span>다시하기</span>
          </button>
          <Link
            href="/"
            onClick={onClose}
            className="py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Home size={18} />
            <span>홈으로</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
