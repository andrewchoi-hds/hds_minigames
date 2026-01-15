'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { shareGameResult, ShareData } from '@/lib/share';

type Props = {
  data: ShareData;
  variant?: 'icon' | 'button' | 'full';
  className?: string;
};

export default function ShareButton({ data, variant = 'button', className = '' }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied' | 'shared'>('idle');

  const handleShare = async () => {
    setStatus('loading');

    const result = await shareGameResult(data);

    if (result.success) {
      setStatus(result.method === 'share' ? 'shared' : 'copied');
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('idle');
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        disabled={status === 'loading'}
        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
        title="공유하기"
      >
        {status === 'copied' ? (
          <Check size={20} className="text-green-500" />
        ) : (
          <Share2 size={20} className="text-gray-600 dark:text-gray-400" />
        )}
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <button
        onClick={handleShare}
        disabled={status === 'loading'}
        className={`
          w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2
          bg-gradient-to-r from-blue-500 to-purple-500 text-white
          hover:shadow-lg active:scale-[0.98] transition-all
          disabled:opacity-50
          ${className}
        `}
      >
        {status === 'copied' ? (
          <>
            <Check size={20} />
            <span>복사됨!</span>
          </>
        ) : status === 'shared' ? (
          <>
            <Check size={20} />
            <span>공유됨!</span>
          </>
        ) : (
          <>
            <Share2 size={20} />
            <span>결과 공유하기</span>
          </>
        )}
      </button>
    );
  }

  // Default button
  return (
    <button
      onClick={handleShare}
      disabled={status === 'loading'}
      className={`
        px-4 py-2 rounded-lg font-medium flex items-center gap-2
        bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
        hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
        disabled:opacity-50
        ${className}
      `}
    >
      {status === 'copied' ? (
        <>
          <Check size={16} className="text-green-500" />
          <span>복사됨</span>
        </>
      ) : (
        <>
          <Share2 size={16} />
          <span>공유</span>
        </>
      )}
    </button>
  );
}
