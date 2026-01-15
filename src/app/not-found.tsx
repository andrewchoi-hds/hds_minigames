'use client';

import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10 text-blue-500" />
        </div>

        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
          404
        </h1>

        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
          페이지를 찾을 수 없습니다
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          요청하신 페이지가 존재하지 않거나
          <br />
          이동되었을 수 있습니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            홈으로 가기
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            뒤로 가기
          </button>
        </div>
      </div>
    </div>
  );
}
