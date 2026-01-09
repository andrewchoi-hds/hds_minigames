import Link from "next/link";
import BaseballGame from "@/components/games/baseball/BaseballGame";

export default function BaseballPage() {
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
          <h1 className="text-2xl font-bold">⚾ 숫자 야구</h1>
          <div className="w-12" />
        </div>

        <BaseballGame />
      </div>
    </main>
  );
}
