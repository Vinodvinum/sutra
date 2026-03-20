"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getAuthClient } from "@/lib/firebaseAuth";
import { calculateLifeScore } from "@/lib/scoreEngine";
import {
  getDailyLog,
  getFinanceLog,
  getInsights,
  getLatestDailyLog,
  getMilestones,
  getTasks,
  saveLifeScore,
  saveTasks,
  updateTask,
} from "@/lib/supabase";
import { generateDailyTasks } from "@/lib/taskGenerator";
import { Insight, LifeScore, Task } from "@/lib/types";

const DashboardFlameChart = dynamic(() => import("@/components/DashboardFlameChart"), {
  ssr: false,
});

const FALLBACK_SCORE: LifeScore = {
  discipline: 55,
  health: 55,
  finance: 55,
  growth: 55,
  total: 55,
  label: "Building",
  labelSanskrit: "\u0928\u093f\u0930\u094d\u092e\u093e\u0923",
  streak: 0,
  change: 0,
  lastUpdated: new Date(),
};

const getTodayIso = (): string => new Date().toISOString().slice(0, 10);
const getMonthKey = (): string => new Date().toISOString().slice(0, 7);

const getBadgeColor = (pillar: Task["pillar"]): string => {
  if (pillar === "discipline") {
    return "rgba(212,168,83,0.12)";
  }

  if (pillar === "health") {
    return "rgba(82,201,122,0.12)";
  }

  if (pillar === "finance") {
    return "rgba(78,143,212,0.12)";
  }

  return "rgba(123,94,167,0.12)";
};

const buildTrendData = (score: LifeScore): Array<{ day: string; score: number }> => {
  const values = [
    Math.max(0, score.total - 9),
    Math.max(0, score.total - 6),
    Math.max(0, score.total - 8),
    Math.max(0, score.total - 4),
    Math.max(0, score.total - 3),
    Math.max(0, score.total - 2),
    score.total,
  ];

  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"].map((day, index) => ({
    day,
    score: Math.min(100, values[index] ?? score.total),
  }));
};

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lifeScore, setLifeScore] = useState<LifeScore>(FALLBACK_SCORE);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const circumference = useMemo(() => 2 * Math.PI * 82, []);
  const scoreOffset = useMemo(
    () => circumference - (lifeScore.total / 100) * circumference,
    [circumference, lifeScore.total]
  );

  const pillarMeta = useMemo(
    () => [
      {
        key: "discipline" as const,
        label: "Tapas",
        sanskrit: "\u0924\u092a",
        score: lifeScore.discipline,
        color: "var(--gold)",
        icon: "\u{1F531}",
      },
      {
        key: "health" as const,
        label: "\u0100rogya",
        sanskrit: "\u0906\u0930\u094b\u0917\u094d\u092f",
        score: lifeScore.health,
        color: "var(--green)",
        icon: "\u{1F49A}",
      },
      {
        key: "finance" as const,
        label: "Artha",
        sanskrit: "\u0905\u0930\u094d\u0925",
        score: lifeScore.finance,
        color: "var(--blue)",
        icon: "\u{1F4AB}",
      },
      {
        key: "growth" as const,
        label: "Vidy\u0101",
        sanskrit: "\u0935\u093f\u0926\u094d\u092f\u093e",
        score: lifeScore.growth,
        color: "var(--sacred)",
        icon: "\u{1FAB7}",
      },
    ],
    [lifeScore.discipline, lifeScore.finance, lifeScore.growth, lifeScore.health]
  );

  const trendData = useMemo(() => buildTrendData(lifeScore), [lifeScore]);

  const syncDashboard = useCallback(async (uid: string): Promise<void> => {
    setLoading(true);

    const today = getTodayIso();
    const month = getMonthKey();

    let todayTasks = await getTasks(uid, today);
    if (todayTasks.length === 0) {
      const latestForGeneration = (await getLatestDailyLog(uid, today)) ?? FALLBACK_SCORE;
      const generated = generateDailyTasks(latestForGeneration);
      await saveTasks(uid, today, generated);
      todayTasks = await getTasks(uid, today);
    }
    setTasks(todayTasks);

    let todayScore = await getDailyLog(uid, today);
    if (!todayScore) {
      const previousLog = await getLatestDailyLog(uid, today);
      const finance = await getFinanceLog(uid, month);
      const milestones = await getMilestones(uid);

      const tasksCompleted = todayTasks.filter((task) => task.completed).length;
      const tasksTotal = todayTasks.length;
      const milestonesThisWeek = milestones.filter((milestone) => {
        const achieved = new Date(milestone.date);
        return Date.now() - achieved.getTime() <= 7 * 86400000;
      }).length;

      const computed = calculateLifeScore(
        {
          tasksCompleted,
          tasksTotal,
          streakDays: previousLog?.streak ?? 0,
          circleCheckinRate: tasksTotal > 0 ? tasksCompleted / tasksTotal : 0,
        },
        {
          sleepHours: 7,
          sleepConsistency: true,
          movementLogged: todayTasks.some((task) => task.pillar === "health" && task.completed),
          daysSinceLastLog: previousLog ? 0 : 1,
        },
        {
          needsAmount: finance?.needs ?? 0,
          wantsAmount: finance?.wants ?? 0,
          wasteAmount: finance?.waste ?? 0,
          totalAmount: finance?.total ?? 0,
          savingsGoalsOnTrack: 0,
          totalSavingsGoals: 0,
          cleanDaysStreak: finance && finance.waste === 0 ? 1 : 0,
        },
        {
          learningLoggedToday: todayTasks.some((task) => task.pillar === "growth" && task.completed),
          milestonesHitThisWeek: milestonesThisWeek,
          reflectionEntries: todayTasks.some((task) => task.pillar === "growth") ? 1 : 0,
        },
        previousLog ? previousLog.streak + (tasksCompleted > 0 ? 1 : 0) : tasksCompleted > 0 ? 1 : 0,
        previousLog?.total
      );

      await saveLifeScore(uid, computed);
      todayScore = computed;
    }

    if (todayScore) {
      setLifeScore(todayScore);
    }

    const insightData = await getInsights(uid);
    setInsights(insightData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const auth = getAuthClient();
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        setUserId(null);
        router.replace("/login");
        return;
      }

      setUserId(firebaseUser.uid);
      void syncDashboard(firebaseUser.uid);
    });

    return () => unsubscribe();
  }, [router, syncDashboard]);

  const handleToggleTask = (taskId: string, currentValue: boolean): void => {
    setTasks((previous) =>
      previous.map((entry) => (entry.id === taskId ? { ...entry, completed: !currentValue } : entry))
    );

    if (!userId) {
      return;
    }

    void (async () => {
      await updateTask(taskId, !currentValue);
      await syncDashboard(userId);
    })();
  };

  const headerInsight = insights[0]?.description ??
    "Yoga is excellence in action. Your mornings now carry real tapas.";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="grid-2">
        <section className="glass-card gold-card" style={{ padding: 22 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>
            LIFE SCORE
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <div style={{ width: 170, height: 170, position: "relative", flexShrink: 0 }}>
              <svg width={170} height={170} viewBox="0 0 170 170" style={{ position: "absolute", inset: 0 }}>
                <circle cx={85} cy={85} r={82} fill="none" stroke="rgba(212,168,83,0.08)" strokeDasharray="6 12" />
                <circle cx={85} cy={85} r={66} fill="none" stroke="rgba(212,168,83,0.05)" strokeDasharray="3 9" />
                <g transform="translate(85,85)" opacity={0.16}>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <ellipse
                      key={`petal-${index.toString()}`}
                      rx={5}
                      ry={13}
                      fill="var(--gold)"
                      transform={`rotate(${index * 45}) translate(0,-62)`}
                    />
                  ))}
                </g>
                <circle cx={85} cy={85} r={54} fill="none" stroke="rgba(212,168,83,0.08)" strokeWidth={8} />
                <circle
                  cx={85}
                  cy={85}
                  r={54}
                  fill="none"
                  stroke="url(#goldGradient)"
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreOffset}
                  transform="rotate(-90 85 85)"
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D4A853" />
                    <stop offset="100%" stopColor="#F0C97A" />
                  </linearGradient>
                </defs>
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div className="font-cinzel" style={{ fontSize: 46, lineHeight: 1, color: "var(--gold)" }}>
                  {lifeScore.total}
                </div>
                <div className="muted" style={{ fontSize: 11 }}>
                  /100
                </div>
              </div>
            </div>
            <div>
              <div className="font-cormorant" style={{ fontStyle: "italic", fontSize: 24, color: "var(--gold2)" }}>
                {lifeScore.label}
              </div>
              <div className="font-dm" style={{ fontSize: 13, color: "var(--green)", marginBottom: 8 }}>
                {`${lifeScore.change && lifeScore.change < 0 ? "\u2193" : "\u2191"} ${Math.abs(lifeScore.change ?? 0)} from yesterday`}
              </div>
              <div
                className="font-cormorant"
                style={{ fontStyle: "italic", color: "var(--white2)", lineHeight: 1.7, marginBottom: 14 }}
              >
                {headerInsight}
              </div>
              <div className="streak-pill" style={{ display: "inline-flex" }}>
                {`\u{1F525} ${lifeScore.streak} Day Agni Streak`}
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card" style={{ padding: 22 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>
            YAGNA GRAPH
          </div>
          <DashboardFlameChart data={trendData} />
        </section>
      </div>

      <div className="grid-4">
        {pillarMeta.map((pillar) => (
          <article key={pillar.key} className="glass-card" style={{ padding: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24 }}>{pillar.icon}</div>
              <div className="font-cinzel" style={{ color: pillar.color, fontSize: 28 }}>
                {pillar.score}
              </div>
              <div className="font-cinzel muted" style={{ fontSize: 10, letterSpacing: 1.5 }}>
                {pillar.label.toUpperCase()}
              </div>
              <div className="font-cormorant" style={{ fontStyle: "italic", fontSize: 12, color: pillar.color }}>
                {pillar.sanskrit}
              </div>
            </div>
            <div className="track" style={{ marginTop: 10 }}>
              <div className="progress" style={{ width: `${pillar.score}%`, background: pillar.color }} />
            </div>
          </article>
        ))}
      </div>

      <div className="grid-2">
        <section className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div className="section-label">TODAY&apos;S DHARMA</div>
            <div className="font-cormorant" style={{ color: "var(--gold)", fontStyle: "italic" }}>
              AI Generated
            </div>
          </div>

          {loading ? (
            <div className="muted" style={{ fontSize: 13, paddingTop: 4 }}>
              Syncing your daily dharma...
            </div>
          ) : (
            tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleToggleTask(task.id, task.completed)}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                  background: "transparent",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: task.completed ? 0.45 : 1,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: `1.5px solid ${task.completed ? "var(--gold)" : "var(--border2)"}`,
                    background: task.completed ? "var(--gold)" : "transparent",
                    color: task.completed ? "var(--bg)" : "transparent",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {"\u2713"}
                </span>
                <span style={{ textAlign: "left", flex: 1 }}>
                  <span style={{ fontSize: 14, textDecoration: task.completed ? "line-through" : "none" }}>
                    {task.title}
                  </span>
                  <span
                    className="font-cormorant muted"
                    style={{ display: "block", fontStyle: "italic", fontSize: 12 }}
                  >
                    {task.meta}
                  </span>
                </span>
                <span
                  className="font-cinzel"
                  style={{
                    fontSize: 9,
                    letterSpacing: 1,
                    borderRadius: 8,
                    padding: "3px 8px",
                    background: getBadgeColor(task.pillar),
                    color: "var(--gold)",
                  }}
                >
                  {task.pillar.toUpperCase()}
                </span>
              </button>
            ))
          )}
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          {(insights.length > 0 ? insights.slice(0, 2) : []).map((insight) => (
            <article
              key={insight.id}
              className="glass-card"
              style={{
                padding: 18,
                borderColor: "rgba(212,168,83,0.16)",
                background: "linear-gradient(135deg, rgba(212,168,83,0.08), rgba(212,168,83,0.02))",
              }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{insight.icon}</span>
                <span>
                  <div className="section-label" style={{ color: "var(--gold)", marginBottom: 4 }}>
                    BRAHMA INSIGHT
                  </div>
                  <div className="font-cormorant" style={{ color: "var(--white2)", fontSize: 16, lineHeight: 1.6 }}>
                    {insight.description}
                  </div>
                </span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

