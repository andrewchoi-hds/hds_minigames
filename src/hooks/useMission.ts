'use client';

import { useCallback } from 'react';
import { GameType } from '@/lib/supabase';
import { recordGamePlay } from '@/lib/mission';
import { Mission } from '@/lib/data/missions';

type GameResult = {
  gameType: GameType;
  score: number;
  won?: boolean;
};

type MissionResult = {
  updatedMissions: string[];
  completedMissions: Mission[];
};

export function useMission() {
  const recordGame = useCallback((result: GameResult): MissionResult => {
    return recordGamePlay(result);
  }, []);

  return { recordGame };
}

export default useMission;
