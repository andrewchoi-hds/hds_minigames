'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GAMES, GameInfo } from '@/lib/data/games';
import { GameIcon } from '@/components/icons';

// 배너에 표시할 게임들 (인기 게임 우선)
const BANNER_GAMES = GAMES.filter((g) => g.isPopular || g.isNew).slice(0, 4);

type BannerSlide = {
  game: GameInfo;
  title: string;
  subtitle: string;
};

const SLIDES: BannerSlide[] = [
  {
    game: BANNER_GAMES[0],
    title: '오늘의 추천',
    subtitle: '지금 바로 도전해보세요!',
  },
  {
    game: BANNER_GAMES[1],
    title: '인기 게임',
    subtitle: '많은 사람들이 즐기고 있어요',
  },
  {
    game: BANNER_GAMES[2],
    title: '두뇌 게임',
    subtitle: '머리를 말랑말랑하게!',
  },
  {
    game: BANNER_GAMES[3],
    title: 'NEW 게임',
    subtitle: '새로 추가된 게임을 만나보세요',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];
  const game = slide.game;

  return (
    <div className="mb-6">
      <Link href={`/${game.id}`}>
        <div
          className={`
            relative overflow-hidden rounded-2xl
            bg-gradient-to-br ${game.gradient}
            p-6 min-h-[160px]
            shadow-lg hover:shadow-xl transition-shadow
          `}
        >
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 50%),
                  radial-gradient(circle at 20% 80%, rgba(255,255,255,0.2) 0%, transparent 40%)
                `,
              }}
            />
          </div>

          {/* 콘텐츠 */}
          <div className="relative z-10 flex items-center justify-between h-full">
            {/* 텍스트 */}
            <div className="text-white">
              <span className="inline-block px-2 py-1 bg-white/20 rounded-full text-xs font-medium mb-2">
                {slide.title}
              </span>
              <h2 className="text-2xl font-bold mb-1">{game.name}</h2>
              <p className="text-white/80 text-sm">{slide.subtitle}</p>
            </div>

            {/* 아이콘 */}
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm transform hover:scale-110 transition-transform">
              <GameIcon gameId={game.id} size={48} className="text-white drop-shadow-lg" />
            </div>
          </div>

          {/* 슬라이드 인디케이터 */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentSlide(idx);
                }}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${idx === currentSlide
                    ? 'bg-white w-6'
                    : 'bg-white/40 hover:bg-white/60'
                  }
                `}
              />
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
