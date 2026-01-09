'use client';

import { useState, useEffect } from 'react';
import { getLocalUser, registerOrLogin, logout, LocalUser } from '@/lib/auth';
import { COUNTRIES, getCountryByCode, DEFAULT_COUNTRY_CODE } from '@/lib/data/countries';

type Props = {
  onAuthChange?: (user: LocalUser | null) => void;
};

export default function UserAuth({ onAuthChange }: Props) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [nickname, setNickname] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY_CODE);
  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const localUser = getLocalUser();
    if (localUser) {
      setUser(localUser);
      onAuthChange?.(localUser);
    }
  }, []);

  const handleRegister = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력하세요');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await registerOrLogin(nickname, selectedCountry);

    setIsLoading(false);

    if (result.success && result.user) {
      const userData: LocalUser = {
        id: result.user.id,
        nickname: result.user.nickname,
        country: selectedCountry,
      };
      setUser(userData);
      onAuthChange?.(userData);
      setShowForm(false);
      setNickname('');
    } else {
      setError(result.error || '오류가 발생했습니다');
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    onAuthChange?.(null);
  };

  // 로그인된 상태
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getCountryByCode(user.country || DEFAULT_COUNTRY_CODE)?.flag}</span>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.nickname[0].toUpperCase()}
          </div>
          <span className="font-medium">{user.nickname}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          로그아웃
        </button>
      </div>
    );
  }

  // 로그인 버튼
  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
      >
        로그인
      </button>
    );
  }

  // 로그인 폼
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <h3 className="font-semibold mb-3">닉네임으로 참여하기</h3>

      <div className="space-y-3">
        {/* 국가 선택 */}
        <div className="relative">
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">국가</label>
          <button
            type="button"
            onClick={() => setShowCountrySelect(!showCountrySelect)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{getCountryByCode(selectedCountry)?.flag}</span>
              <span>{getCountryByCode(selectedCountry)?.nameKo}</span>
            </span>
            <span className="text-gray-400">▼</span>
          </button>

          {showCountrySelect && (
            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(country.code);
                    setShowCountrySelect(false);
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedCountry === country.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span>{country.nameKo}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 닉네임 입력 */}
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            placeholder="2~20자"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:border-blue-500 focus:outline-none"
            maxLength={20}
            disabled={isLoading}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowForm(false);
              setError('');
              setNickname('');
              setShowCountrySelect(false);
            }}
            className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            disabled={isLoading || !nickname.trim()}
          >
            {isLoading ? '처리 중...' : '시작하기'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        닉네임은 한글, 영문, 숫자, _만 사용 가능합니다
      </p>
    </div>
  );
}
