import Link from "next/link";

const games = [
  {
    id: "sudoku",
    name: "스도쿠",
    description: "숫자 퍼즐의 고전",
    emoji: "🔢",
  },
  {
    id: "puzzle-2048",
    name: "2048",
    description: "숫자를 합쳐 2048을 만들어라",
    emoji: "🎯",
  },
  {
    id: "memory",
    name: "메모리 게임",
    description: "카드 짝 맞추기",
    emoji: "🃏",
  },
  {
    id: "minesweeper",
    name: "지뢰찾기",
    description: "지뢰를 피해 모든 칸을 열어라",
    emoji: "💣",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Mini Games</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          가볍게 즐기는 미니게임 플랫폼
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/${game.id}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="text-4xl mb-3">{game.emoji}</div>
              <h2 className="text-xl font-semibold mb-1">{game.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {game.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
