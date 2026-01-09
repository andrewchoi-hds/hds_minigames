'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  initGame,
  handleClick,
  setGo,
  getAverageTime,
  getBestTime,
  getGrade,
  getPercentile,
} from '@/lib/games/reaction';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

const ROUND_OPTIONS = [3, 5, 10];

export default function ReactionGame() {
  const [roundCount, setRoundCount] = useState(5);
  const [gameState, setGameState] = useState<GameState>(() => initGame(roundCount));
  const [bestRecord, setBestRecord] = useState<number>(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 로컬 스토리지에서 최고 기록 로드
  useEffect(() => {
    const saved = localStorage.getItem('reaction-best');
    if (saved) {
      setBestRecord(parseInt(saved));
    }
  }, []);

  // 라운드 수 변경 시 게임 리셋
  useEffect(() => {
    setGameState(initGame(roundCount));
  }, [roundCount]);

  // Ready → Go 전환 타이머
  useEffect(() => {
    if (gameState.phase === 'ready') {
      timerRef.current = setTimeout(() => {
        setGameState((prev) => setGo(prev));
      }, gameState.waitTime);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [gameState.phase, gameState.waitTime]);

  // 결과 저장
  useEffect(() => {
    if (gameState.phase === 'result') {
      const avg = getAverageTime(gameState.results);
      if (avg > 0 && (bestRecord === 0 || avg < bestRecord)) {
        setBestRecord(avg);
        localStorage.setItem('reaction-best', avg.toString());
      }
    }
  }, [gameState.phase, gameState.results, bestRecord]);

  // 클릭 핸들러
  const onClick = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setGameState((prev) => handleClick(prev));
  }, []);

  // 새 게임
  const newGame = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setGameState(initGame(roundCount));
  };

  // 배경색 및 메시지
  const getPhaseStyle = () => {
    switch (gameState.phase) {
      case 'waiting':
        return {
          bg: 'bg-blue-500',
          text: '클릭하여 시작',
          subtext: `${gameState.currentRound}/${gameState.totalRounds} 라운드`,
        };
      case 'ready':
        return {
          bg: 'bg-red-500',
          text: '기다리세요...',
          subtext: '초록색이 되면 클릭!',
        };
      case 'go':
        return {
          bg: 'bg-green-500',
          text: '클릭!',
          subtext: '',
        };
      case 'tooEarly':
        return {
          bg: 'bg-yellow-500',
          text: '너무 빨라요!',
          subtext: '다시 클릭하여 시도',
        };
      case 'result':
        return {
          bg: 'bg-purple-500',
          text: '완료!',
          subtext: '',
        };
      default:
        return { bg: 'bg-gray-500', text: '', subtext: '' };
    }
  };

  const phaseStyle = getPhaseStyle();
  const avgTime = getAverageTime(gameState.results);
  const bestTime = getBestTime(gameState.results);
  const grade = getGrade(avgTime);
  const percentile = getPercentile(avgTime);

  // 결과 화면
  if (gameState.phase === 'result') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg">
          <div className={`text-6xl font-bold mb-2 ${grade.color}`}>{grade.grade}</div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{grade.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-500">{avgTime}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">평균 (ms)</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-500">{bestTime}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">최고 (ms)</div>
            </div>
          </div>

          {/* 각 라운드 결과 */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
            <div className="text-sm font-semibold mb-2">라운드별 기록</div>
            <div className="flex justify-center gap-2 flex-wrap">
              {gameState.results.map((r, i) => (
                <div
                  key={i}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    r.reactionTime === bestTime
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  {r.reactionTime}ms
                </div>
              ))}
            </div>
          </div>

          {/* 백분위 */}
          <div className="mb-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              상위 {100 - percentile}%
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all"
                style={{ width: `${percentile}%` }}
              />
            </div>
          </div>

          {/* 최고 기록 */}
          {bestRecord > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              역대 최고 기록: <span className="font-bold text-blue-500">{bestRecord}ms</span>
            </div>
          )}

          {/* 점수 */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 mb-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">점수</div>
            <div className="text-2xl font-bold text-blue-500">
              {ScoreCalculator.reaction(avgTime).toLocaleString()}점
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={newGame}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              다시 하기
            </button>
            <button
              onClick={() => setShowScoreModal(true)}
              className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              랭킹 등록
            </button>
          </div>
        </div>

        {/* 점수 제출 모달 */}
        <ScoreSubmitModal
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          gameType="reaction"
          score={ScoreCalculator.reaction(avgTime)}
          metadata={{ avgTime, bestTime, rounds: roundCount }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 라운드 선택 (대기 중일 때만) */}
      {gameState.phase === 'waiting' && gameState.currentRound === 1 && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">
            라운드 수
          </div>
          <div className="flex justify-center gap-2">
            {ROUND_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={(e) => {
                  e.stopPropagation();
                  setRoundCount(count);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  roundCount === count
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {count}회
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 진행 상황 */}
      {gameState.phase !== 'waiting' && (
        <div className="mb-4 flex justify-center gap-2">
          {Array(gameState.totalRounds)
            .fill(null)
            .map((_, i) => {
              const result = gameState.results[i];
              const isCurrent = i === gameState.currentRound - 1 && gameState.phase !== 'result';

              return (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    result
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {result ? result.reactionTime : i + 1}
                </div>
              );
            })}
        </div>
      )}

      {/* 메인 클릭 영역 */}
      <button
        onClick={onClick}
        className={`w-full h-64 sm:h-80 rounded-2xl flex flex-col items-center justify-center transition-colors cursor-pointer ${phaseStyle.bg}`}
      >
        <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{phaseStyle.text}</div>
        {phaseStyle.subtext && (
          <div className="text-lg text-white/80">{phaseStyle.subtext}</div>
        )}

        {/* Go 상태에서 마지막 결과 표시 */}
        {gameState.phase === 'go' && gameState.results.length > 0 && (
          <div className="mt-4 text-white/60 text-sm">
            이전: {gameState.results[gameState.results.length - 1].reactionTime}ms
          </div>
        )}
      </button>

      {/* 최고 기록 */}
      {bestRecord > 0 && gameState.phase === 'waiting' && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          최고 기록: <span className="font-bold text-blue-500">{bestRecord}ms</span>
        </div>
      )}

      {/* 도움말 */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm">
        <h3 className="font-semibold mb-2">게임 방법</h3>
        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
          <li>
            • <span className="text-red-500 font-bold">빨간색</span>: 기다리세요
          </li>
          <li>
            • <span className="text-green-500 font-bold">초록색</span>: 최대한 빨리 클릭!
          </li>
          <li>• 초록색이 되기 전에 클릭하면 실패</li>
          <li>• {roundCount}회 측정 후 평균 계산</li>
        </ul>
      </div>
    </div>
  );
}
