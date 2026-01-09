'use client';

import { useEffect, useState } from 'react';

type Props = {
  show: boolean;
};

export default function KonamiEffect({ show }: Props) {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; emoji: string; delay: number }[]
  >([]);

  useEffect(() => {
    if (show) {
      const emojis = ['🎮', '🕹️', '👾', '🎯', '🏆', '⭐', '🌟', '✨', '🎉', '🎊'];
      const newParticles = Array(30)
        .fill(null)
        .map((_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          delay: Math.random() * 0.5,
        }));
      setParticles(newParticles);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* 중앙 메시지 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-bounce bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl transform">
          <div className="text-2xl sm:text-4xl font-bold text-center">
            🎮 KONAMI CODE! 🎮
          </div>
          <div className="text-sm sm:text-lg text-center mt-1 opacity-90">
            ↑↑↓↓←→←→BA
          </div>
        </div>
      </div>

      {/* 파티클 이펙트 */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-2xl sm:text-4xl animate-float-up"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* 레인보우 보더 */}
      <div className="absolute inset-0 border-8 animate-rainbow-border rounded-none" />

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-200px) scale(0) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes rainbow-border {
          0% {
            border-color: #ff0000;
          }
          17% {
            border-color: #ff8000;
          }
          33% {
            border-color: #ffff00;
          }
          50% {
            border-color: #00ff00;
          }
          67% {
            border-color: #0080ff;
          }
          83% {
            border-color: #8000ff;
          }
          100% {
            border-color: #ff0000;
          }
        }

        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }

        .animate-rainbow-border {
          animation: rainbow-border 0.5s linear infinite;
        }
      `}</style>
    </div>
  );
}
