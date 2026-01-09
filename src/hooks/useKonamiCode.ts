'use client';

import { useState, useEffect, useCallback } from 'react';

// 코나미 코드: ↑↑↓↓←→←→BA
const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export function useKonamiCode(callback?: () => void) {
  const [isActivated, setIsActivated] = useState(false);
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [showEffect, setShowEffect] = useState(false);

  const resetSequence = useCallback(() => {
    setInputSequence([]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 무시
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.code;
      const newSequence = [...inputSequence, key].slice(-KONAMI_CODE.length);
      setInputSequence(newSequence);

      // 코나미 코드 완성 확인
      if (newSequence.length === KONAMI_CODE.length) {
        const isMatch = newSequence.every((k, i) => k === KONAMI_CODE[i]);
        if (isMatch && !isActivated) {
          setIsActivated(true);
          setShowEffect(true);
          callback?.();

          // 이펙트 자동 종료
          setTimeout(() => {
            setShowEffect(false);
          }, 3000);

          resetSequence();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputSequence, isActivated, callback, resetSequence]);

  const reset = useCallback(() => {
    setIsActivated(false);
    setShowEffect(false);
    resetSequence();
  }, [resetSequence]);

  return { isActivated, showEffect, reset };
}
