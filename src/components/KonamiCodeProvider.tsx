'use client';

import { useKonamiCode } from '@/hooks/useKonamiCode';
import KonamiEffect from './KonamiEffect';

export default function KonamiCodeProvider() {
  const { showEffect } = useKonamiCode();

  return <KonamiEffect show={showEffect} />;
}
