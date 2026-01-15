'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              오류가 발생했습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                다시 시도
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                홈으로
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 게임 전용 에러 바운더리 (더 가벼운 UI)
export function GameErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundaryWrapper>
      {children}
    </ErrorBoundaryWrapper>
  );
}

// 함수형 래퍼 (hooks 사용 가능하도록)
function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            게임 로딩 중 오류가 발생했습니다
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            새로고침
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
