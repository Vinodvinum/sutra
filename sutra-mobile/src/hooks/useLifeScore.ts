import { useCallback, useEffect, useState } from 'react';

import { LifeScore } from '../constants/types';
import { getDailyLog, getLatestDailyLog } from '../lib/supabase';

interface UseLifeScoreResult {
  lifeScore: LifeScore | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const getTodayDate = (): string => new Date().toISOString().slice(0, 10);

const DEFAULT_LIFE_SCORE: LifeScore = {
  discipline: 55,
  health: 55,
  finance: 55,
  growth: 55,
  total: 55,
  label: 'Building',
  labelSanskrit: '\u0928\u093f\u0930\u094d\u092e\u093e\u0923',
  streak: 0,
  change: 0,
  lastUpdated: new Date(),
};

export default function useLifeScore(userId: string | null | undefined): UseLifeScoreResult {
  const [lifeScore, setLifeScore] = useState<LifeScore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async (): Promise<void> => {
    if (!userId) {
      setLifeScore(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const today = getTodayDate();
    const todayLog = await getDailyLog(userId, today);

    if (todayLog) {
      setLifeScore(todayLog);
      setLoading(false);
      return;
    }

    const latestLog = await getLatestDailyLog(userId);
    setLifeScore(latestLog ?? DEFAULT_LIFE_SCORE);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    lifeScore,
    loading,
    refresh,
  };
}
