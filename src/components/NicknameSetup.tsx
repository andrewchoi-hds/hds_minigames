'use client';

import { useState } from 'react';
import { registerOrLogin, LocalUser } from '@/lib/auth';
import { COUNTRIES, getCountryByCode, DEFAULT_COUNTRY_CODE } from '@/lib/data/countries';

type Props = {
  onComplete: (user: LocalUser) => void;
};

export default function NicknameSetup({ onComplete }: Props) {
  const [nickname, setNickname] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY_CODE);
  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력하세요');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await registerOrLogin(nickname, selectedCountry);

    setIsLoading(false);

    if (result.success && result.user) {
      onComplete({
        id: result.user.id,
        nickname: result.user.nickname,
        country: selectedCountry,
      });
    } else {
      setError(result.error || '오류가 발생했습니다');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl font-bold mb-2">Mini Games</h1>
          <p className="text-gray-500 dark:text-gray-400">
            게임을 시작하기 전에 닉네임을 설정해주세요
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="space-y-4">
            {/* 국가 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                국가
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountrySelect(!showCountrySelect)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-between text-lg"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{getCountryByCode(selectedCountry)?.flag}</span>
                    <span>{getCountryByCode(selectedCountry)?.nameKo}</span>
                  </span>
                  <span className="text-gray-400">▼</span>
                </button>

                {showCountrySelect && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg">
                    {COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country.code);
                          setShowCountrySelect(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          selectedCountry === country.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        <span className="text-2xl">{country.flag}</span>
                        <span>{country.nameKo}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 닉네임 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="2~20자, 한글/영문/숫자/_"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:border-blue-500 focus:outline-none text-lg"
                maxLength={20}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-500 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading || !nickname.trim()}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-xl font-bold text-lg transition-colors"
            >
              {isLoading ? '확인 중...' : '시작하기'}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            닉네임은 랭킹에 표시됩니다
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
          이미 사용 중인 닉네임을 입력하면 해당 계정으로 로그인됩니다
        </div>
      </div>
    </div>
  );
}
