'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 서비스에 전송 (Sentry 등)
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          오류가 발생했습니다
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          페이지를 불러오는 중 문제가 발생했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            다시 시도
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
