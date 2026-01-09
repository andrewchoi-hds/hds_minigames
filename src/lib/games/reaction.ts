// 반응속도 테스트 게임 로직

export type GamePhase = 'waiting' | 'ready' | 'go' | 'result' | 'tooEarly';

export type RoundResult = {
  reactionTime: number; // ms
  round: number;
};

export type GameState = {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  results: RoundResult[];
  startTime: number | null;
  waitTime: number; // 대기 시간 (ms)
};

// 게임 초기화
export function initGame(totalRounds: number = 5): GameState {
  return {
    phase: 'waiting',
    currentRound: 1,
    totalRounds,
    results: [],
    startTime: null,
    waitTime: 0,
  };
}

// 대기 상태로 전환 (랜덤 대기 시간 설정)
export function setReady(state: GameState): GameState {
  // 1~5초 사이의 랜덤 대기 시간
  const waitTime = 1000 + Math.random() * 4000;

  return {
    ...state,
    phase: 'ready',
    waitTime,
    startTime: null,
  };
}

// Go 상태로 전환
export function setGo(state: GameState): GameState {
  return {
    ...state,
    phase: 'go',
    startTime: Date.now(),
  };
}

// 클릭 처리
export function handleClick(state: GameState): GameState {
  switch (state.phase) {
    case 'waiting':
      return setReady(state);

    case 'ready':
      // 너무 빨리 클릭
      return {
        ...state,
        phase: 'tooEarly',
      };

    case 'go':
      // 반응 시간 측정
      const reactionTime = Date.now() - (state.startTime || 0);
      const newResults = [
        ...state.results,
        { reactionTime, round: state.currentRound },
      ];

      const isLastRound = state.currentRound >= state.totalRounds;

      return {
        ...state,
        phase: isLastRound ? 'result' : 'waiting',
        currentRound: isLastRound ? state.currentRound : state.currentRound + 1,
        results: newResults,
        startTime: null,
      };

    case 'tooEarly':
      // 다시 시도
      return setReady(state);

    case 'result':
      // 새 게임
      return initGame(state.totalRounds);

    default:
      return state;
  }
}

// 평균 반응 시간 계산
export function getAverageTime(results: RoundResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + r.reactionTime, 0);
  return Math.round(sum / results.length);
}

// 최고 반응 시간
export function getBestTime(results: RoundResult[]): number {
  if (results.length === 0) return 0;
  return Math.min(...results.map((r) => r.reactionTime));
}

// 등급 계산
export function getGrade(avgTime: number): { grade: string; color: string; description: string } {
  if (avgTime === 0) {
    return { grade: '-', color: 'text-gray-500', description: '' };
  }
  if (avgTime < 150) {
    return { grade: 'S+', color: 'text-purple-500', description: '초인적인 반응속도!' };
  }
  if (avgTime < 200) {
    return { grade: 'S', color: 'text-red-500', description: '프로 게이머 수준' };
  }
  if (avgTime < 250) {
    return { grade: 'A', color: 'text-orange-500', description: '매우 빠름' };
  }
  if (avgTime < 300) {
    return { grade: 'B', color: 'text-yellow-500', description: '평균 이상' };
  }
  if (avgTime < 350) {
    return { grade: 'C', color: 'text-green-500', description: '평균' };
  }
  if (avgTime < 400) {
    return { grade: 'D', color: 'text-blue-500', description: '평균 이하' };
  }
  return { grade: 'F', color: 'text-gray-500', description: '더 연습이 필요해요' };
}

// 백분위 계산 (대략적인 수치)
export function getPercentile(avgTime: number): number {
  if (avgTime === 0) return 0;
  if (avgTime < 150) return 99;
  if (avgTime < 180) return 95;
  if (avgTime < 200) return 90;
  if (avgTime < 220) return 80;
  if (avgTime < 250) return 70;
  if (avgTime < 280) return 60;
  if (avgTime < 300) return 50;
  if (avgTime < 330) return 40;
  if (avgTime < 360) return 30;
  if (avgTime < 400) return 20;
  if (avgTime < 450) return 10;
  return 5;
}
