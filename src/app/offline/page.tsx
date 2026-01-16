'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-10 h-10 text-gray-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            오프라인 상태
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mb-6">
            인터넷 연결이 끊어졌습니다.
            <br />
            연결 상태를 확인하고 다시 시도해주세요.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              <RefreshCw size={20} />
              다시 시도
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
            >
              <Home size={20} />
              홈으로
            </Link>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          일부 게임은 오프라인에서도 플레이할 수 있습니다
        </p>
      </div>
    </div>
  );
}
