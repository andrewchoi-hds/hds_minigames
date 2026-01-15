'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  initGame,
  startGame,
  selectAnswer,
  decreaseTime,
  calculateScore,
  getGrade,
} from '@/lib/games/color-match';
import ScoreSubmitModal from '@/components/ranking/ScoreSubmitModal';
import { ScoreCalculator } from '@/lib/ranking';

export default function ColorMatchGame() {
  const [gameState, setGameState] = useState<GameState>(() => initGame());
  const [bestScore, setBestScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 로컬 스토리지에서 최고 기록 로드
  useEffect(() => {
    const saved = localStorage.getItem('color-match-best');
    if (saved) {
      setBestScore(parseInt(saved));
    }
  }, []);

  // 게임 오버 시 최고 기록 저장
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > bestScore) {
      setBestScore(gameState.score);
      localStorage.setItem('color-match-best', gameState.score.toString());
    }
  }, [gameState.isGameOver, gameState.score, bestScore]);

  // 타이머
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      timerRef.current = setInterval(() => {
        setGameState(prev => decreaseTime(prev));
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [gameState.isPlaying, gameState.isGameOver]);

  // 답변 선택
  const handleSelectAnswer = useCallback((optionId: number) => {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    const selectedOption = gameState.options.find(o => o.id === optionId);
    if (!selectedOption) return;

    // 피드백 표시
    setFeedback(selectedOption.isCorrect ? 'correct' : 'wrong');
    setTimeout(() => setFeedback(null), 300);

    setGameState(prev => selectAnswer(prev, optionId));
  }, [gameState.isPlaying, gameState.isGameOver, gameState.options]);

  // 게임 시작
  const handleStart = useCallback(() => {
    const newState = initGame();
    setGameState(startGame(newState));
  }, []);

  // 새 게임
  const handleNewGame = () => {
    setGameState(initGame());
  };

  const grade = getGrade(gameState.score);
  const finalScore = calculateScore(gameState.score, gameState.round, gameState.maxStreak);

  return (
    <div className="w-full">
      {/* 점수 표시 */}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">점수</div>
            <div className="text-2xl font-bold font-mono">{gameState.score}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">연속</div>
            <div className="text-xl font-bold text-orange-500">🔥 {gameState.streak}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">목숨</div>
            <div className="text-lg">
              {'❤️'.repeat(gameState.lives)}{'🖤'.repeat(Math.max(0, 3 - gameState.lives))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">시간</div>
            <div className={`text-xl font-bold ${gameState.timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}>
              {gameState.timeLeft}s
            </div>
          </div>
        </div>
      </div>

      {/* 게임 영역 */}
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transition-all ${
          feedback === 'correct' ? 'ring-4 ring-green-400' :
          feedback === 'wrong' ? 'ring-4 ring-red-400' : ''
        }`}
      >
        {/* 시작 전 */}
        {!gameState.isPlaying && !gameState.isGameOver && (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold mb-2">색상 맞추기</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              글자의 &quot;단어&quot; 또는 &quot;색상&quot;을 맞추세요!
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              스트룹 효과를 경험해보세요
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              시작하기
            </button>
          </div>
        )}

        {/* 게임 진행 중 */}
        {gameState.isPlaying && !gameState.isGameOver && (
          <div>
            {/* 라운드 표시 */}
            <div className="text-center mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                라운드 {gameState.round}
              </span>
            </div>

            {/* 질문 */}
            <div className="text-center mb-6">
              <div className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                {gameState.questionType === 'word' ? (
                  <>이 단어가 <span className="font-bold text-purple-500">뜻하는</span> 색상은?</>
                ) : (
                  <>이 글자의 <span className="font-bold text-pink-500">실제 색</span>은?</>
                )}
              </div>
              <div
                className="text-5xl font-black py-4 select-none"
                style={{ color: gameState.displayedWordColor }}
              >
                {gameState.displayedWord}
              </div>
            </div>

            {/* 선택지 */}
            <div className="grid grid-cols-2 gap-3">
              {gameState.options.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(option.id)}
                  className="py-4 px-6 rounded-xl font-bold text-white transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: option.hex }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 게임 오버 */}
        {gameState.isGameOver && (
          <div className="text-center py-6">
            <div className={`text-4xl font-bold mb-1 ${grade.color}`}>{grade.grade}</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{grade.description}</p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <div className="text-xs text-gray-500">라운드</div>
                <div className="font-bold">{gameState.round}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <div className="text-xs text-gray-500">최대 연속</div>
                <div className="font-bold text-orange-500">🔥 {gameState.maxStreak}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <div className="text-xs text-gray-500">최고</div>
                <div className="font-bold text-blue-500">{bestScore}</div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-3 mb-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">최종 점수</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {finalScore.toLocaleString()}점
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleNewGame}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                다시 하기
              </button>
              <button
                onClick={() => setShowScoreModal(true)}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                랭킹 등록
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 도움말 */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm">
        <h3 className="font-semibold mb-2">게임 방법</h3>
        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
          <li>• <span className="text-purple-500 font-medium">단어가 뜻하는 색</span>: 글자 내용과 같은 색 선택</li>
          <li>• <span className="text-pink-500 font-medium">글자의 실제 색</span>: 글자가 표시된 색 선택</li>
          <li>• 정답 시 시간 보너스 +2초</li>
          <li>• 연속 정답 시 추가 점수!</li>
        </ul>
      </div>

      {/* 점수 제출 모달 */}
      <ScoreSubmitModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        gameType="color-match"
        score={ScoreCalculator.colorMatch(gameState.score, gameState.round, gameState.maxStreak)}
        metadata={{
          rounds: gameState.round,
          maxStreak: gameState.maxStreak,
        }}
      />
    </div>
  );
}
