import { supabase, User } from './supabase';

const USER_STORAGE_KEY = 'minigames-user';

// 로컬 스토리지에서 사용자 정보 가져오기
export function getLocalUser(): { id: string; nickname: string } | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// 로컬 스토리지에 사용자 정보 저장
export function setLocalUser(user: { id: string; nickname: string }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

// 로컬 스토리지에서 사용자 정보 삭제
export function clearLocalUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_STORAGE_KEY);
}

// 닉네임으로 회원가입/로그인
export async function registerOrLogin(
  nickname: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  // 닉네임 유효성 검사
  const trimmed = nickname.trim();
  if (trimmed.length < 2 || trimmed.length > 20) {
    return { success: false, error: '닉네임은 2~20자여야 합니다' };
  }

  if (!/^[a-zA-Z0-9가-힣_]+$/.test(trimmed)) {
    return { success: false, error: '닉네임은 한글, 영문, 숫자, _만 사용 가능합니다' };
  }

  // 기존 사용자 확인
  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('nickname', trimmed)
    .single();

  if (existingUser) {
    // 기존 사용자로 로그인
    setLocalUser({ id: existingUser.id, nickname: existingUser.nickname });
    return { success: true, user: existingUser };
  }

  // 새 사용자 생성
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({ nickname: trimmed })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      // unique violation - 동시 생성 충돌
      return { success: false, error: '이미 사용 중인 닉네임입니다' };
    }
    return { success: false, error: `등록 중 오류: ${insertError.message}` };
  }

  setLocalUser({ id: newUser.id, nickname: newUser.nickname });
  return { success: true, user: newUser };
}

// 현재 로그인된 사용자 정보 가져오기
export async function getCurrentUser(): Promise<User | null> {
  const localUser = getLocalUser();
  if (!localUser) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', localUser.id)
    .single();

  if (error || !data) {
    clearLocalUser();
    return null;
  }

  return data;
}

// 로그아웃
export function logout() {
  clearLocalUser();
}

// 닉네임 중복 확인
export async function checkNicknameAvailable(nickname: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('nickname', nickname.trim())
    .single();

  return !data;
}
