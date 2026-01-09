import Link from "next/link";

export default function MinesweeperPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          ← 돌아가기
        </Link>
        <h1 className="text-3xl font-bold mb-4">💣 지뢰찾기</h1>
        <p className="text-gray-600 dark:text-gray-400">
          지뢰찾기 게임이 곧 추가됩니다!
        </p>
      </div>
    </main>
  );
}
