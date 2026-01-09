'use client';

import { useState, useEffect } from 'react';
import { getLocalUser, registerOrLogin } from '@/lib/auth';
import { submitScore } from '@/lib/ranking';
import { GameType, GAME_NAMES } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  gameType: GameType;
  difficulty?: string;
  score: number;
  timeSeconds?: number;
  metadata?: Record<string, unknown>;
  onSubmitSuccess?: () => void;
};

export default function ScoreSubmitModal({
  isOpen,
  onClose,
  gameType,
  difficulty,
  score,
  timeSeconds,
  metadata,
  onSubmitSuccess,
}: Props) {
  const [user, setUser] = useState<{ id: string; nickname: string } | null>(null);
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const localUser = getLocalUser();
      setUser(localUser);
      setIsSubmitted(false);
      setError('');
    }
  }, [isOpen]);

  const handleRegisterAndSubmit = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력하세요');
      return;
    }

    setIsLoading(true);
    setError('');

    // 등록/로그인
    const registerResult = await registerOrLogin(nickname);
    if (!registerResult.success) {
      setError(registerResult.error || '오류가 발생했습니다');
      setIsLoading(false);
      return;
    }

    setUser({ id: registerResult.user!.id, nickname: registerResult.user!.nickname });

    // 점수 제출
    await doSubmitScore();
  };

  const doSubmitScore = async () => {
    setIsLoading(true);
    setError('');

    const result = await submitScore({
      gameType,
      difficulty,
      score,
      timeSeconds,
      metadata,
    });

    setIsLoading(false);

    if (result.success) {
      setIsSubmitted(true);
      onSubmitSuccess?.();
    } else {
      setError(result.error || '점수 제출 중 오류가 발생했습니다');
    }
  };

  if (!isOpen) return null;

  // 제출 완료 화면
  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-xl max-w-sm w-full">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-xl font-bold mb-2">점수 등록 완료!</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {GAME_NAMES[gameType]} 랭킹에 등록되었습니다
          </p>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
            <div className="text-3xl font-bold text-blue-500">{score.toLocaleString()}점</div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-sm w-full">
        <h3 className="text-xl font-bold mb-4 text-center">🏆 랭킹 등록</h3>

        {/* 점수 표시 */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {GAME_NAMES[gameType]}
            {difficulty && ` - ${difficulty}`}
          </div>
          <div className="text-3xl font-bold">{score.toLocaleString()}점</div>
          {timeSeconds && (
            <div className="text-sm text-gray-500 mt-1">
              {Math.floor(timeSeconds / 60)}:{(timeSeconds % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        {/* 로그인 안 된 경우 */}
        {!user ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              랭킹에 등록하려면 닉네임을 입력하세요
            </p>

            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegisterAndSubmit()}
              placeholder="닉네임 (2~20자)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:border-blue-500 focus:outline-none"
              maxLength={20}
              disabled={isLoading}
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                나중에
              </button>
              <button
                onClick={handleRegisterAndSubmit}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                disabled={isLoading || !nickname.trim()}
              >
                {isLoading ? '처리 중...' : '등록하기'}
              </button>
            </div>
          </div>
        ) : (
          /* 이미 로그인된 경우 */
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.nickname[0].toUpperCase()}
              </div>
              <span className="font-medium">{user.nickname}</span>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                나중에
              </button>
              <button
                onClick={doSubmitScore}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? '등록 중...' : '랭킹 등록'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
