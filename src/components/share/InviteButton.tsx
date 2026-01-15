'use client';

import { useState } from 'react';
import { UserPlus, Copy, Check } from 'lucide-react';
import { shareInvite } from '@/lib/share';
import { getLocalUser } from '@/lib/auth';

type Props = {
  variant?: 'card' | 'button';
  className?: string;
};

export default function InviteButton({ variant = 'button', className = '' }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied' | 'shared'>('idle');

  const handleInvite = async () => {
    setStatus('loading');

    const user = getLocalUser();
    const result = await shareInvite(user?.nickname);

    if (result.success) {
      setStatus(result.method === 'share' ? 'shared' : 'copied');
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('idle');
    }
  };

  if (variant === 'card') {
    return (
      <button
        onClick={handleInvite}
        disabled={status === 'loading'}
        className={`
          w-full p-4 rounded-2xl
          bg-gradient-to-r from-violet-500 to-purple-600
          text-white shadow-lg
          hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
          transition-all disabled:opacity-50
          ${className}
        `}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            {status === 'copied' || status === 'shared' ? (
              <Check size={24} />
            ) : (
              <UserPlus size={24} />
            )}
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-lg">
              {status === 'copied'
                ? '링크가 복사되었습니다!'
                : status === 'shared'
                ? '초대를 보냈습니다!'
                : '친구 초대하기'}
            </p>
            <p className="text-white/80 text-sm">
              {status === 'idle' && '친구에게 공유하고 함께 즐겨보세요'}
            </p>
          </div>
        </div>
      </button>
    );
  }

  // Default button
  return (
    <button
      onClick={handleInvite}
      disabled={status === 'loading'}
      className={`
        px-4 py-2 rounded-lg font-medium flex items-center gap-2
        bg-violet-500 text-white
        hover:bg-violet-600 transition-colors
        disabled:opacity-50
        ${className}
      `}
    >
      {status === 'copied' || status === 'shared' ? (
        <>
          <Check size={16} />
          <span>{status === 'copied' ? '복사됨' : '공유됨'}</span>
        </>
      ) : (
        <>
          <UserPlus size={16} />
          <span>친구 초대</span>
        </>
      )}
    </button>
  );
}
