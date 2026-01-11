'use client';

type Props = {
  onNumberClick: (num: number) => void;
  onClear: () => void;
  onUndo: () => void;
  isNoteMode: boolean;
  onNoteModeToggle: () => void;
  onHint: () => void;
  hintsRemaining: number;
  completedNumbers?: Set<number>; // 9개 모두 사용된 숫자들
};

export default function NumberPad({
  onNumberClick,
  onClear,
  onUndo,
  isNoteMode,
  onNoteModeToggle,
  onHint,
  hintsRemaining,
  completedNumbers = new Set(),
}: Props) {
  return (
    <div className="w-full">
      {/* 숫자 패드 */}
      <div className="grid grid-cols-9 gap-1.5 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const isCompleted = completedNumbers.has(num);
          return (
            <button
              key={num}
              onClick={() => !isCompleted && onNumberClick(num)}
              disabled={isCompleted}
              className={`aspect-square text-xl font-semibold rounded-xl transition-all duration-150 ${
                isCompleted
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 active:bg-blue-200 dark:active:bg-blue-800 shadow-sm hover:shadow'
              }`}
            >
              {isCompleted ? '' : num}
            </button>
          );
        })}
      </div>

      {/* 컨트롤 버튼 */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onUndo}
          className="py-3 flex flex-col items-center gap-1 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 rounded-xl transition-all duration-150"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span className="text-xs font-medium">실행취소</span>
        </button>

        <button
          onClick={onClear}
          className="py-3 flex flex-col items-center gap-1 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 rounded-xl transition-all duration-150"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
          <span className="text-xs font-medium">지우기</span>
        </button>

        <button
          onClick={onNoteModeToggle}
          className={`py-3 flex flex-col items-center gap-1 rounded-xl transition-all duration-150 ${
            isNoteMode
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span className="text-xs font-medium">메모</span>
        </button>

        <button
          onClick={onHint}
          disabled={hintsRemaining === 0}
          className={`py-3 flex flex-col items-center gap-1 rounded-xl transition-all duration-150 ${
            hintsRemaining > 0
              ? 'bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-900 shadow-md'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-xs font-medium">힌트 ({hintsRemaining})</span>
        </button>
      </div>
    </div>
  );
}
