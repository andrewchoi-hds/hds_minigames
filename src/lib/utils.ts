import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 클래스 병합 유틸리티 (Tailwind CSS 충돌 해결)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
