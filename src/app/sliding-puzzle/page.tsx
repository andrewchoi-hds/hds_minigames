import Link from "next/link";
import SlidingPuzzleGame from "@/components/games/sliding-puzzle/SlidingPuzzleGame";

export default function SlidingPuzzlePage() {
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
          <h1 className="text-2xl font-bold">🧩 슬라이딩 퍼즐</h1>
          <div className="w-12" />
        </div>

        <SlidingPuzzleGame />
      </div>
    </main>
  );
}
