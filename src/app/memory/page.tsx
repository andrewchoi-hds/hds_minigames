import Link from "next/link";
import MemoryGame from "@/components/games/memory/MemoryGame";

export default function MemoryPage() {
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
          <h1 className="text-2xl font-bold">🃏 메모리 게임</h1>
          <div className="w-12" />
        </div>

        <MemoryGame />
      </div>
    </main>
  );
}
