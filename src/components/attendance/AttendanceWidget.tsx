'use client';

import { useState, useEffect } from 'react';
import {
  hasCheckedInToday,
  checkIn,
  getAttendanceLog,
  getMonthlyAttendance,
  ATTENDANCE_REWARDS,
} from '@/lib/attendance';
import { getUserPoints } from '@/lib/mission';
import { Calendar, Gift, Check, Flame } from 'lucide-react';

export default function AttendanceWidget() {
  const [checked, setChecked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{
    points: number;
    bonusPoints?: number;
    streak: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadStatus();
  }, []);

  const loadStatus = () => {
    setChecked(hasCheckedInToday());
    const log = getAttendanceLog();
    setStreak(log.streak);
  };

  const handleCheckIn = () => {
    if (checked) {
      setShowModal(true);
      return;
    }

    const result = checkIn();
    if (result.success) {
      setCheckInResult({
        points: result.points!,
        bonusPoints: result.bonusPoints,
        streak: result.streak!,
      });
      setChecked(true);
      setStreak(result.streak!);
      setShowModal(true);
    }
  };

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm animate-pulse">
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleCheckIn}
        className={`
          w-full rounded-2xl p-4 shadow-sm transition-all
          ${checked
            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
            : 'bg-gradient-to-r from-orange-400 to-pink-500 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
          }
        `}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {checked ? <Check size={28} /> : <Calendar size={28} />}
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">
                {checked ? '출석 완료!' : '출석 체크'}
              </p>
              <p className="text-white/80 text-sm">
                {checked
                  ? `${streak}일 연속 출석 중`
                  : `매일 +${ATTENDANCE_REWARDS.BASE_POINTS}P`}
              </p>
            </div>
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
              <Flame size={16} className="text-yellow-300" />
              <span className="font-bold">{streak}일</span>
            </div>
          )}
        </div>
      </button>

      {/* 출석 체크 결과 모달 */}
      {showModal && (
        <AttendanceModal
          checked={checked}
          result={checkInResult}
          streak={streak}
          onClose={() => {
            setShowModal(false);
            setCheckInResult(null);
          }}
        />
      )}
    </>
  );
}

// 출석 체크 모달
function AttendanceModal({
  checked,
  result,
  streak,
  onClose,
}: {
  checked: boolean;
  result: { points: number; bonusPoints?: number; streak: number } | null;
  streak: number;
  onClose: () => void;
}) {
  const monthly = getMonthlyAttendance();
  const today = new Date().getDate();

  // 이번 달 캘린더 생성
  const firstDay = new Date(monthly.year, monthly.month - 1, 1).getDay();
  const days = Array.from({ length: monthly.totalDays }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => null);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 결과 표시 (방금 체크인 했을 때) */}
        {result && (
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              출석 완료!
            </h2>
            <div className="flex items-center justify-center gap-2 text-yellow-500">
              <Gift size={20} />
              <span className="text-2xl font-bold">+{result.points}P</span>
            </div>
            {result.bonusPoints && (
              <p className="text-sm text-green-500 mt-1">
                연속 출석 보너스 +{result.bonusPoints}P 포함!
              </p>
            )}
          </div>
        )}

        {/* 연속 출석 표시 */}
        {!result && (
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame size={24} className="text-orange-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {streak}일 연속
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              내일도 출석하면 보너스!
            </p>
          </div>
        )}

        {/* 이번 달 캘린더 */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 text-center">
            {monthly.year}년 {monthly.month}월 출석 현황
          </p>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="text-gray-400 py-1">
                {day}
              </div>
            ))}
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const isChecked = monthly.dates.includes(day);
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center mx-auto
                    ${isChecked
                      ? 'bg-green-500 text-white'
                      : isToday
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 font-bold'
                      : 'text-gray-600 dark:text-gray-400'
                    }
                  `}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* 연속 출석 보너스 안내 */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            연속 출석 보너스
          </p>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {Object.entries(ATTENDANCE_REWARDS.STREAK_BONUS).map(([days, points]) => (
              <div
                key={days}
                className={`py-1 rounded ${
                  streak >= parseInt(days)
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'text-gray-400'
                }`}
              >
                <div className="font-bold">{days}일</div>
                <div>+{points}P</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}
