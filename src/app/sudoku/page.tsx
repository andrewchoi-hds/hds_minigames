import Link from "next/link";
import SudokuGame from "@/components/games/sudoku/SudokuGame";

export default function SudokuPage() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            ← 홈
          </Link>
          <h1 className="text-2xl font-bold">🔢 스도쿠</h1>
          <div className="w-12" /> {/* 균형용 빈 공간 */}
        </div>

        <SudokuGame />
      </div>
    </main>
  );
}
