import { GameType, GAME_NAMES } from './supabase';

// 공유 데이터 타입
export type ShareData = {
  gameType: GameType;
  score: number;
  rank?: number;
  message?: string;
};

// 게임 결과 공유 텍스트 생성
export function generateShareText(data: ShareData): string {
  const gameName = GAME_NAMES[data.gameType] || data.gameType;
  const scoreText = data.score.toLocaleString();

  let text = `🎮 Mini Games - ${gameName}\n`;
  text += `🏆 점수: ${scoreText}점\n`;

  if (data.rank) {
    const rankEmoji = data.rank === 1 ? '🥇' : data.rank === 2 ? '🥈' : data.rank === 3 ? '🥉' : '🎖️';
    text += `${rankEmoji} 랭킹: ${data.rank}위\n`;
  }

  if (data.message) {
    text += `\n${data.message}\n`;
  }

  text += `\n나도 도전해보기 👇`;

  return text;
}

// 앱 초대 텍스트 생성
export function generateInviteText(nickname?: string): string {
  let text = '🎮 Mini Games에 초대합니다!\n\n';

  if (nickname) {
    text += `${nickname}님이 당신을 초대했습니다.\n\n`;
  }

  text += '다양한 미니게임을 즐기고 랭킹에 도전해보세요!\n';
  text += '매일 출석하면 포인트도 받을 수 있어요 🎁\n';

  return text;
}

// Web Share API 지원 여부
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

// 클립보드 복사
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch {
    return false;
  }
}

// 게임 결과 공유
export async function shareGameResult(
  data: ShareData,
  url?: string
): Promise<{ success: boolean; method: 'share' | 'clipboard'; error?: string }> {
  const text = generateShareText(data);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.origin : '');

  // Web Share API 사용 시도
  if (canShare()) {
    try {
      await navigator.share({
        title: `Mini Games - ${GAME_NAMES[data.gameType]}`,
        text,
        url: shareUrl,
      });
      return { success: true, method: 'share' };
    } catch (error: any) {
      // 사용자가 취소한 경우
      if (error.name === 'AbortError') {
        return { success: false, method: 'share', error: '공유가 취소되었습니다' };
      }
    }
  }

  // Fallback: 클립보드 복사
  const fullText = `${text}\n\n${shareUrl}`;
  const copied = await copyToClipboard(fullText);

  if (copied) {
    return { success: true, method: 'clipboard' };
  }

  return { success: false, method: 'clipboard', error: '공유에 실패했습니다' };
}

// 앱 초대 공유
export async function shareInvite(
  nickname?: string,
  url?: string
): Promise<{ success: boolean; method: 'share' | 'clipboard'; error?: string }> {
  const text = generateInviteText(nickname);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.origin : '');

  // Web Share API 사용 시도
  if (canShare()) {
    try {
      await navigator.share({
        title: 'Mini Games 초대',
        text,
        url: shareUrl,
      });
      return { success: true, method: 'share' };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, method: 'share', error: '공유가 취소되었습니다' };
      }
    }
  }

  // Fallback: 클립보드 복사
  const fullText = `${text}\n${shareUrl}`;
  const copied = await copyToClipboard(fullText);

  if (copied) {
    return { success: true, method: 'clipboard' };
  }

  return { success: false, method: 'clipboard', error: '공유에 실패했습니다' };
}
