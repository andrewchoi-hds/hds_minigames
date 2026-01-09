'use client';

type Props = {
  onNumberClick: (num: number) => void;
  onClear: () => void;
  onUndo: () => void;
  isNoteMode: boolean;
  onNoteModeToggle: () => void;
  onHint: () => void;
  hintsRemaining: number;
};

export default function NumberPad({
  onNumberClick,
  onClear,
  onUndo,
  isNoteMode,
  onNoteModeToggle,
  onHint,
  hintsRemaining,
}: Props) {
  return (
    <div className="max-w-md mx-auto mt-4">
      {/* 숫자 패드 */}
      <div className="grid grid-cols-9 gap-1 mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className="aspect-square text-lg font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {num}
          </button>
        ))}
      </div>

      {/* 컨트롤 버튼 */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onUndo}
          className="py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
        >
          ↩️ 실행취소
        </button>
        <button
          onClick={onClear}
          className="py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
        >
          ✕ 지우기
        </button>
        <button
          onClick={onNoteModeToggle}
          className={`py-3 px-4 rounded-lg transition-colors text-sm font-medium ${
            isNoteMode
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          ✏️ 메모
        </button>
        <button
          onClick={onHint}
          disabled={hintsRemaining === 0}
          className={`py-3 px-4 rounded-lg transition-colors text-sm font-medium ${
            hintsRemaining > 0
              ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
          }`}
        >
          💡 힌트 ({hintsRemaining})
        </button>
      </div>
    </div>
  );
}
