'use client';

import { useKonamiCode } from '@/hooks/useKonamiCode';
import KonamiEffect from './KonamiEffect';

export default function KonamiCodeProvider() {
  const { showEffect } = useKonamiCode(() => {
    // 콘솔에 비밀 메시지
    console.log(
      '%c🎮 KONAMI CODE ACTIVATED! 🎮',
      'font-size: 24px; color: #ff00ff; font-weight: bold;'
    );
    console.log(
      '%c↑↑↓↓←→←→BA - You found the secret!',
      'font-size: 14px; color: #00ff00;'
    );
  });

  return <KonamiEffect show={showEffect} />;
}
