import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

import {
  Circle,
  CircleMember,
  FinanceLog,
  Insight,
  LifeScore,
  Milestone,
  Task,
  UserProfile,
} from "./types";
import { getPublicEnv } from "./publicEnv";

const publicEnv = getPublicEnv();
const supabaseUrl = publicEnv.supabaseUrl;
const supabaseAnonKey = publicEnv.supabaseAnonKey;

let cachedClient: SupabaseClient | null = null;

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value)
    ? value
    : typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))
      ? Number(value)
      : fallback;

const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

const asRecordArray = (value: unknown): JsonRecord[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

const asDate = (value: unknown): Date => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
};

const getScoreLabel = (score: number): { label: string; sanskrit: string } => {
  if (score >= 93) return { label: "Legendary", sanskrit: "\u092e\u0939\u093e\u0928" };
  if (score >= 81) return { label: "Elite", sanskrit: "\u0936\u094d\u0930\u0947\u0937\u094d\u0920" };
  if (score >= 66) return { label: "Disciplined", sanskrit: "\u0905\u0928\u0941\u0936\u093e\u0938\u093f\u0924" };
  if (score >= 41) return { label: "Building", sanskrit: "\u0928\u093f\u0930\u094d\u092e\u093e\u0923" };
  return { label: "Rebuilding", sanskrit: "\u092a\u0941\u0928\u0930\u094d\u0928\u093f\u0930\u094d\u092e\u093e\u0923" };
};

const mapProfile = (value: unknown): UserProfile | null => {
  if (!isRecord(value)) {
    return null;
  }

  const createdAt = asString(value.created_at);

  return {
    id: asString(value.id),
    name: asString(value.name, "Sadhak"),
    emoji: asString(value.avatar_emoji, "\u{1F9D8}"),
    joinedDate: createdAt,
    dayCount: asNumber(value.day_count, 0),
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
  const scoreLabel = getScoreLabel(total);

  return {
    discipline: asNumber(value.discipline_score),
    health: asNumber(value.health_score),
    finance: asNumber(value.finance_score),
    growth: asNumber(value.growth_score),
    total,
    label: scoreLabel.label,
    labelSanskrit: scoreLabel.sanskrit,
    streak: asNumber(value.streak_count),
    change: 0,
    lastUpdated: asDate(value.created_at ?? value.date),
  };
};

const mapTask = (value: unknown): Task => {
  const taskValue = isRecord(value) ? value : {};
  const pillarValue = asString(taskValue.pillar, "discipline");
  const pillar: Task["pillar"] =
    pillarValue === "health" || pillarValue === "finance" || pillarValue === "growth"
      ? pillarValue
      : "discipline";

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
    icon: asString(milestoneValue.icon, "\u{1F3C6}"),
    title: asString(milestoneValue.title),
    date: asString(milestoneValue.achieved_at, asString(milestoneValue.date)),
    type: asString(milestoneValue.milestone_type, asString(milestoneValue.type)),
  };
};

const getMonthDateRange = (month: string): { start: string; end: string } => {
  const [yearString, monthString] = month.split("-");
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

export const getSupabaseClient = (): SupabaseClient => {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
};

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProfile(data);
  } catch {
    return null;
  }
};

export const getDailyLog = async (userId: string, date: string): Promise<LifeScore | null> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDailyLog(data);
  } catch {
    return null;
  }
};

export const getLatestDailyLog = async (
  userId: string,
  beforeDate?: string
): Promise<LifeScore | null> => {
  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(1);

    if (beforeDate) {
      query = query.lt("date", beforeDate);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDailyLog(data);
  } catch {
    return null;
  }
};

export const getTasks = async (userId: string, date: string): Promise<Task[]> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .order("created_at", { ascending: true });

    if (error || !data) {
      return [];
    }

    return asRecordArray(data).map(mapTask);
  } catch {
    return [];
  }
};

export const saveTasks = async (userId: string, date: string, tasks: Task[]): Promise<void> => {
  try {
    const payload = tasks.map((task) => ({
      user_id: userId,
      date,
      title: task.title,
      pillar: task.pillar,
      completed: task.completed,
      ai_generated: task.aiGenerated ?? true,
      meta_text: task.meta,
    }));

    if (payload.length === 0) {
      return;
    }

    const supabase = getSupabaseClient();
    await supabase.from("tasks").insert(payload);
  } catch {
    return;
  }
};

export const updateTask = async (taskId: string, completed: boolean): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    await supabase.from("tasks").update({ completed }).eq("id", taskId);
  } catch {
    return;
  }
};

export const getCircles = async (userId: string): Promise<Circle[]> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("circle_members")
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
      .eq("user_id", userId);

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
        const createdAt = asDate(circle.created_at);
        const daysTogether = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / 86400000) + 1);
        grouped.set(circleId, {
          id: circleId,
          name: asString(circle.name, "Sacred Circle"),
          members: [],
          avgScore: 0,
          daysTogether,
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
        name: asString(memberRecord.name, "Sadhak"),
        emoji: asString(memberRecord.avatar_emoji, "\u{1F9D8}"),
        role: "Sadhak",
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
};

export const getInsights = async (userId: string): Promise<Insight[]> => {
  try {
    void userId;

    return [
      {
        id: "insight-pattern",
        type: "pattern",
        title: "You peak between 9-11 AM",
        description: "Your brahma muhurta - three weeks confirm this.",
        pillar: "Tapas",
        icon: "\u26A1",
      },
      {
        id: "insight-risk",
        type: "risk",
        title: "The body is sending a warning",
        description: "Three nights poor sleep. Restore tonight.",
        pillar: "\u0100rogya",
        icon: "\u26A0\uFE0F",
      },
      {
        id: "insight-win",
        type: "win",
        title: "Seven days of financial dharma",
        description: "Zero waste spending. Arthashastra wisdom in action.",
        pillar: "Artha",
        icon: "\u2705",
      },
      {
        id: "insight-focus",
        type: "focus",
        title: "Knowledge is being neglected",
        description: "Vidy\u0101 - 20 minutes daily transforms growth.",
        pillar: "Vidy\u0101",
        icon: "\u{1FAB7}",
      },
    ];
  } catch {
    return [];
  }
};

export const getFinanceLog = async (userId: string, month: string): Promise<FinanceLog | null> => {
  try {
    const supabase = getSupabaseClient();
    const { start, end } = getMonthDateRange(month);
    const { data, error } = await supabase
      .from("finance_logs")
      .select("amount, category")
      .eq("user_id", userId)
      .gte("date", start)
      .lt("date", end);

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
        if (category === "needs") {
          acc.needs += amount;
        } else if (category === "wants") {
          acc.wants += amount;
        } else if (category === "waste") {
          acc.waste += amount;
        }
        return acc;
      },
      { needs: 0, wants: 0, waste: 0 }
    );

    const total = totals.needs + totals.wants + totals.waste;

    return {
      needs: totals.needs,
      wants: totals.wants,
      waste: totals.waste,
      total,
      month,
      score: calculateFinanceScore(totals.needs, totals.wants, totals.waste),
    };
  } catch {
    return null;
  }
};

export const saveFinanceEntry = async (
  userId: string,
  date: string,
  amount: number,
  category: "needs" | "wants" | "waste",
  description: string
): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    await supabase.from("finance_logs").insert({
      user_id: userId,
      date,
      amount,
      category,
      description,
    });
  } catch {
    return;
  }
};

export const getMilestones = async (userId: string): Promise<Milestone[]> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("milestones")
      .select("*")
      .eq("user_id", userId)
      .order("achieved_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return asRecordArray(data).map(mapMilestone);
  } catch {
    return [];
  }
};

export const saveLifeScore = async (userId: string, score: LifeScore): Promise<void> => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const supabase = getSupabaseClient();
    await supabase.from("daily_logs").upsert(
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
      { onConflict: "user_id,date" }
    );
  } catch {
    return;
  }
};

