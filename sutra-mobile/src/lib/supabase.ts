import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import {
  Circle,
  CircleMember,
  FinanceLog,
  Insight,
  LifeScore,
  Milestone,
  Task,
  User,
} from '../constants/types';
import { getScoreLabel } from './scoreEngine';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? value
    : typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))
      ? Number(value)
      : fallback;

const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const asDate = (value: unknown): Date => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
};

const asRecordArray = (value: unknown): JsonRecord[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

const mapProfile = (value: unknown): User | null => {
  if (!isRecord(value)) {
    return null;
  }

  const createdAt = asString(value.created_at);
  const joinedDate = createdAt || asString(value.joined_date);
  const dayCount = asNumber(value.day_count, asNumber(value.dayCount));

  return {
    id: asString(value.id),
    name: asString(value.name, 'Sadhak'),
    emoji: asString(value.avatar_emoji, asString(value.emoji, '\u{1F9D8}')),
    joinedDate,
    dayCount,
    goals: asStringArray(value.goals),
    selectedPillars: asStringArray(value.selected_pillars),
    onboardingComplete: asBoolean(value.onboarding_complete),
    baselineComplete: asBoolean(value.baseline_complete),
  };
};

const mapDailyLog = (value: unknown): LifeScore | null => {
  if (!isRecord(value)) {
    return null;
  }

  const total = asNumber(value.life_score);
  const { label, sanskrit } = getScoreLabel(total);

  return {
    discipline: asNumber(value.discipline_score),
    health: asNumber(value.health_score),
    finance: asNumber(value.finance_score),
    growth: asNumber(value.growth_score),
    total,
    label,
    labelSanskrit: sanskrit,
    streak: asNumber(value.streak_count),
    change: 0,
    lastUpdated: asDate(value.created_at ?? value.date),
  };
};

const mapTask = (value: unknown): Task => {
  const taskValue = isRecord(value) ? value : {};
  const pillarValue = asString(taskValue.pillar, 'discipline');
  const pillar: Task['pillar'] =
    pillarValue === 'health' || pillarValue === 'finance' || pillarValue === 'growth'
      ? pillarValue
      : 'discipline';

  return {
    id: asString(taskValue.id),
    title: asString(taskValue.title),
    pillar,
    completed: asBoolean(taskValue.completed),
    meta: asString(taskValue.meta_text, asString(taskValue.meta)),
    aiGenerated: asBoolean(taskValue.ai_generated, true),
    date: asString(taskValue.date),
  };
};

const mapMilestone = (value: unknown): Milestone => {
  const milestoneValue = isRecord(value) ? value : {};

  return {
    id: asString(milestoneValue.id),
    icon: asString(milestoneValue.icon, '\u{1F3C6}'),
    title: asString(milestoneValue.title),
    date: asString(milestoneValue.achieved_at, asString(milestoneValue.date)),
    type: asString(milestoneValue.milestone_type, asString(milestoneValue.type)),
  };
};

const getMonthDateRange = (month: string): { start: string; end: string } => {
  const [yearString, monthString] = month.split('-');
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;
  const startDate = new Date(Date.UTC(year, monthIndex, 1));
  const endDate = new Date(Date.UTC(year, monthIndex + 1, 1));

  return {
    start: startDate.toISOString().slice(0, 10),
    end: endDate.toISOString().slice(0, 10),
  };
};

const calculateFinanceScore = (needs: number, wants: number, waste: number): number => {
  const total = needs + wants + waste;
  if (total <= 0) {
    return 0;
  }

  const wastePercent = waste / total;
  const needsRatio = needs / total;
  const wantsPenalty = wants / total > 0.4 ? 8 : 0;
  const score = 100 - wastePercent * 60 + Math.min(25, needsRatio * 35) - wantsPenalty;

  return Math.max(0, Math.min(100, Math.round(score)));
};

export async function getProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProfile(data);
  } catch {
    return null;
  }
}

export async function getDailyLog(userId: string, date: string): Promise<LifeScore | null> {
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDailyLog(data);
  } catch {
    return null;
  }
}

export async function getLatestDailyLog(
  userId: string,
  beforeDate?: string
): Promise<LifeScore | null> {
  try {
    let query = supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1);

    if (beforeDate) {
      query = query.lt('date', beforeDate);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDailyLog(data);
  } catch {
    return null;
  }
}

export async function getTasks(userId: string, date: string): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return asRecordArray(data).map(mapTask);
  } catch {
    return [];
  }
}

export async function saveTasks(userId: string, date: string, tasks: Task[]): Promise<void> {
  try {
    const payload = tasks.map((task) => ({
      user_id: userId,
      date,
      title: task.title,
      pillar: task.pillar,
      completed: task.completed,
      ai_generated: task.aiGenerated,
      meta_text: task.meta,
    }));

    if (payload.length === 0) {
      return;
    }

    await supabase.from('tasks').insert(payload);
  } catch {
    return;
  }
}

export async function updateTask(taskId: string, completed: boolean): Promise<void> {
  try {
    await supabase.from('tasks').update({ completed }).eq('id', taskId);
  } catch {
    return;
  }
}

export async function getCircles(userId: string): Promise<Circle[]> {
  try {
    const { data, error } = await supabase
      .from('circle_members')
      .select(
        `
          circle_id,
          trust_score,
          circle:circles(
            id,
            name,
            invite_code,
            created_at
          ),
          member:profiles(
            id,
            name,
            avatar_emoji
          )
        `
      )
      .eq('user_id', userId);

    if (error || !data) {
      return [];
    }

    const grouped = new Map<string, Circle>();
    asRecordArray(data).forEach((row) => {
      const circle = isRecord(row.circle) ? row.circle : {};
      const circleId = asString(circle.id, asString(row.circle_id));
      if (!circleId) {
        return;
      }

      if (!grouped.has(circleId)) {
        grouped.set(circleId, {
          id: circleId,
          name: asString(circle.name, 'Sacred Circle'),
          members: [],
          avgScore: 0,
          daysTogether: 0,
          inviteCode: asString(circle.invite_code),
        });
      }

      const target = grouped.get(circleId);
      if (!target) {
        return;
      }

      const memberRecord = isRecord(row.member) ? row.member : {};
      const member: CircleMember = {
        id: asString(memberRecord.id, circleId),
        name: asString(memberRecord.name, 'Sadhak'),
        emoji: asString(memberRecord.avatar_emoji, '\u{1F9D8}'),
        role: 'member',
        streak: 0,
        checkedIn: true,
        trustScore: asNumber(row.trust_score, 50),
        lifeScore: 0,
      };
      target.members.push(member);
    });

    return Array.from(grouped.values()).map((circle) => {
      const trustTotal = circle.members.reduce((acc, member) => acc + member.trustScore, 0);
      const avg = circle.members.length > 0 ? Math.round(trustTotal / circle.members.length) : 0;

      return {
        ...circle,
        avgScore: avg,
      };
    });
  } catch {
    return [];
  }
}

export async function getInsights(userId: string): Promise<Insight[]> {
  try {
    void userId;

    return [
      {
        type: 'pattern',
        pillar: 'discipline',
        title: 'Tapas rhythm is stabilizing',
        description:
          'Your Tapas (\u0924\u092a) consistency improves when tasks are completed before noon.',
        icon: '\u26A1',
      },
      {
        type: 'risk',
        pillar: 'health',
        title: 'Arogya recovery risk detected',
        description:
          '\u0100rogya (\u0906\u0930\u094b\u0917\u094d\u092f) dips after poor sleep nights. Restore tonight.',
        icon: '\u26A0\uFE0F',
      },
      {
        type: 'win',
        pillar: 'finance',
        title: 'Artha discipline is compounding',
        description:
          'Artha (\u0905\u0930\u094d\u0925) waste ratio stayed low this week. Savings momentum is rising.',
        icon: '\u{1F4AB}',
      },
      {
        type: 'focus',
        pillar: 'growth',
        title: 'Vidy\u0101 focus for next cycle',
        description:
          'Vidy\u0101 (\u0935\u093f\u0926\u094d\u092f\u093e) deepens with one reflection ritual daily for 7 days.',
        icon: '\u{1FAB7}',
      },
    ];
  } catch {
    return [];
  }
}

export async function getFinanceLog(userId: string, month: string): Promise<FinanceLog | null> {
  try {
    const { start, end } = getMonthDateRange(month);
    const { data, error } = await supabase
      .from('finance_logs')
      .select('amount, category')
      .eq('user_id', userId)
      .gte('date', start)
      .lt('date', end);

    if (error || !data) {
      return null;
    }

    const rows = asRecordArray(data);
    if (rows.length === 0) {
      return null;
    }

    const totals = rows.reduce<{ needs: number; wants: number; waste: number }>(
      (acc, row) => {
        const amount = asNumber(row.amount);
        const category = asString(row.category);
        if (category === 'needs') {
          acc.needs += amount;
        } else if (category === 'wants') {
          acc.wants += amount;
        } else if (category === 'waste') {
          acc.waste += amount;
        }
        return acc;
      },
      { needs: 0, wants: 0, waste: 0 }
    );

    const total = totals.needs + totals.wants + totals.waste;
    const score = calculateFinanceScore(totals.needs, totals.wants, totals.waste);

    return {
      needs: totals.needs,
      wants: totals.wants,
      waste: totals.waste,
      total,
      month,
      score,
    };
  } catch {
    return null;
  }
}

export async function saveFinanceEntry(
  userId: string,
  date: string,
  amount: number,
  category: 'needs' | 'wants' | 'waste',
  description: string
): Promise<void> {
  try {
    await supabase.from('finance_logs').insert({
      user_id: userId,
      date,
      amount,
      category,
      description,
    });
  } catch {
    return;
  }
}

export async function getMilestones(userId: string): Promise<Milestone[]> {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return asRecordArray(data).map(mapMilestone);
  } catch {
    return [];
  }
}

export async function saveLifeScore(userId: string, score: LifeScore): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10);

    await supabase.from('daily_logs').upsert(
      {
        user_id: userId,
        date: today,
        discipline_score: score.discipline,
        health_score: score.health,
        finance_score: score.finance,
        growth_score: score.growth,
        life_score: score.total,
        streak_count: score.streak,
        tasks_completed: 0,
        tasks_total: 0,
      },
      { onConflict: 'user_id,date' }
    );
  } catch {
    return;
  }
}

export default supabase;
