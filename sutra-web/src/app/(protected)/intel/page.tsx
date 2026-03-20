"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getAuthClient } from "@/lib/firebaseAuth";
import { getDailyLog, getInsights, getLatestDailyLog, getTasks } from "@/lib/supabase";
import { Insight, LifeScore } from "@/lib/types";

const FALLBACK_SCORE: LifeScore = {
  discipline: 55,
  health: 55,
  finance: 55,
  growth: 55,
  total: 55,
  label: "Building",
  labelSanskrit: "\u0928\u093f\u0930\u094d\u092e\u093e\u0923",
  streak: 0,
};

const typeColor: Record<Insight["type"], string> = {
  pattern: "var(--gold)",
  risk: "var(--red)",
  win: "var(--green)",
  focus: "var(--sacred)",
};

const typeLabel: Record<Insight["type"], string> = {
  pattern: "\u26A1 PATTERN",
  risk: "\u26A0\uFE0F RISK",
  win: "\u2705 VICTORY",
  focus: "\u{1FAB7} FOCUS",
};

const getWeekLabel = (): string => {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const diff = (Date.now() - start.getTime()) / 86400000;
  const weekNumber = Math.ceil((diff + start.getDay() + 1) / 7);
  return `WEEK ${weekNumber}`;
};

export default function IntelPage() {
  const router = useRouter();
  const [lifeScore, setLifeScore] = useState<LifeScore>(FALLBACK_SCORE);
  const [karmaDone, setKarmaDone] = useState<number>(0);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const auth = getAuthClient();
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/login");
        return;
      }

      void (async () => {
        const today = new Date().toISOString().slice(0, 10);
        const [todayLog, latestLog, todayTasks, insightRows] = await Promise.all([
          getDailyLog(firebaseUser.uid, today),
          getLatestDailyLog(firebaseUser.uid, today),
          getTasks(firebaseUser.uid, today),
          getInsights(firebaseUser.uid),
        ]);

        if (todayLog) {
          setLifeScore(todayLog);
        } else if (latestLog) {
          setLifeScore(latestLog);
        }

        const totalTasks = todayTasks.length;
        const completed = todayTasks.filter((task) => task.completed).length;
        const completion = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
        setKarmaDone(completion);

        setInsights(insightRows);
      })();
    });

    return () => unsubscribe();
  }, [router]);

  const stats = useMemo(
    () => [
      [`${lifeScore.total}`, "LIFE SCORE", `${lifeScore.change && lifeScore.change < 0 ? "\u2193" : "\u2191"} ${Math.abs(lifeScore.change ?? 0)}`, "var(--green)"],
      [`${karmaDone}%`, "KARMA DONE", `${karmaDone >= 60 ? "\u2191" : "\u2193"} ${karmaDone}%`, karmaDone >= 60 ? "var(--green)" : "var(--red)"],
      [`${lifeScore.streak}d`, "AGNI STREAK", "BEST", "var(--gold)"],
    ],
    [karmaDone, lifeScore.change, lifeScore.streak, lifeScore.total]
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="glass-card" style={{ padding: 22, borderColor: "rgba(212,168,83,0.18)" }}>
        <div className="section-label" style={{ color: "var(--gold)", marginBottom: 14 }}>
          {getWeekLabel()} REPORT
        </div>
        <div className="grid-4" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
          {stats.map((stat) => (
            <div key={stat[1]} style={{ textAlign: "center" }}>
              <div className="font-cinzel" style={{ fontSize: 38, lineHeight: 1 }}>
                {stat[0]}
              </div>
              <div className="font-cinzel muted" style={{ fontSize: 9, letterSpacing: 1.5 }}>
                {stat[1]}
              </div>
              <div className="font-dm" style={{ fontSize: 11, color: stat[3] }}>
                {stat[2]}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-label" style={{ color: "var(--gold)" }}>
        BRAHMIC INSIGHTS
      </div>

      {insights.map((insight) => (
        <article
          key={insight.id}
          className="glass-card"
          style={{ padding: 20, borderColor: `${typeColor[insight.type]}33` }}
        >
          <div
            className="font-cinzel"
            style={{ fontSize: 9, letterSpacing: 2, marginBottom: 8, color: typeColor[insight.type] }}
          >
            {typeLabel[insight.type]} — {insight.pillar.toUpperCase()}
          </div>
          <div className="font-cormorant" style={{ fontSize: 22, marginBottom: 6 }}>
            {insight.title}
          </div>
          <div className="font-cormorant" style={{ color: "var(--white2)", fontSize: 15, lineHeight: 1.7 }}>
            {insight.description}
          </div>
        </article>
      ))}
    </div>
  );
}

