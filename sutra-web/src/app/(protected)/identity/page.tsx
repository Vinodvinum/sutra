"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getAuthClient } from "@/lib/firebaseAuth";
import { getDailyLog, getLatestDailyLog, getMilestones, getProfile } from "@/lib/supabase";
import { LifeScore, Milestone, UserProfile } from "@/lib/types";

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

const FALLBACK_MILESTONES: Milestone[] = [
  { id: "mile-1", icon: "\u{1F525}", title: "12-Day Agni Streak", date: "Personal best · Today" },
  { id: "mile-2", icon: "\u{1F4B0}", title: "Artha — 7 Days Clean", date: "March 11-18" },
  { id: "mile-3", icon: "\u26A1", title: "First Score Above 65", date: "March 10" },
  { id: "mile-4", icon: "\u{1FAB7}", title: "30-Day Sadhak", date: "February 2025" },
  { id: "mile-5", icon: "\u25CE", title: "First Circle Created", date: "February 15" },
];

const formatMilestoneDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const getDayCount = (profile: UserProfile | null): number => {
  if (profile?.dayCount && profile.dayCount > 0) {
    return profile.dayCount;
  }

  if (!profile?.joinedDate) {
    return 1;
  }

  const joined = new Date(profile.joinedDate);
  if (Number.isNaN(joined.getTime())) {
    return 1;
  }

  return Math.max(1, Math.floor((Date.now() - joined.getTime()) / 86400000) + 1);
};

export default function IdentityPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lifeScore, setLifeScore] = useState<LifeScore>(FALLBACK_SCORE);
  const [milestones, setMilestones] = useState<Milestone[]>(FALLBACK_MILESTONES);

  useEffect(() => {
    const auth = getAuthClient();
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        setUserId(null);
        router.replace("/login");
        return;
      }

      setUserId(firebaseUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    void (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [userProfile, todayLog, latestLog, milestoneRows] = await Promise.all([
        getProfile(userId),
        getDailyLog(userId, today),
        getLatestDailyLog(userId, today),
        getMilestones(userId),
      ]);

      setProfile(userProfile);
      if (todayLog) {
        setLifeScore(todayLog);
      } else if (latestLog) {
        setLifeScore(latestLog);
      }

      if (milestoneRows.length > 0) {
        setMilestones(milestoneRows);
      }
    })();
  }, [userId]);

  const dayCount = useMemo(() => getDayCount(profile), [profile]);

  const pillars = useMemo(
    () => [
      { name: "Tapas", score: lifeScore.discipline, color: "var(--gold)" },
      { name: "Arogya", score: lifeScore.health, color: "var(--green)" },
      { name: "Artha", score: lifeScore.finance, color: "var(--blue)" },
      { name: "Vidya", score: lifeScore.growth, color: "var(--sacred)" },
    ],
    [lifeScore.discipline, lifeScore.finance, lifeScore.growth, lifeScore.health]
  );

  const reliability = Math.max(60, Math.min(99, lifeScore.discipline));
  const trustScore = Math.max(50, Math.min(99, Math.round(lifeScore.total + 16)));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section
        className="glass-card"
        style={{
          padding: 22,
          background:
            "linear-gradient(135deg, rgba(212,168,83,0.18), rgba(123,94,167,0.16), rgba(17,22,32,0.92))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "1px solid var(--gold)",
                background: "var(--golddim)",
                boxShadow: "0 0 16px rgba(212,168,83,0.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 36,
              }}
            >
              {profile?.emoji ?? "\u{1F9D8}"}
            </div>
            <div>
              <div className="font-cinzel" style={{ fontSize: 26, letterSpacing: 2 }}>
                {(profile?.name ?? "Sadhak").toUpperCase()}
              </div>
              <div className="font-cormorant muted" style={{ fontStyle: "italic", fontSize: 16 }}>
                {`\u0938\u093e\u0927\u0915 — Seeker · Day ${dayCount.toString()}`}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              className="font-cinzel"
              style={{
                fontSize: 68,
                lineHeight: 0.9,
                color: "var(--gold)",
                textShadow: "0 0 16px rgba(212,168,83,0.4)",
              }}
            >
              {lifeScore.total}
            </div>
            <div className="font-cormorant muted" style={{ fontStyle: "italic" }}>
              {lifeScore.label}
            </div>
          </div>
        </div>
      </section>

      <div className="grid-2">
        <section className="glass-card" style={{ padding: 18 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>
            CHAKRA BALANCE
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            {pillars.map((pillar) => (
              <div
                key={pillar.name}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  background: "var(--surface)",
                  padding: "12px 10px",
                }}
              >
                <div className="font-cinzel" style={{ color: pillar.color, fontSize: 30, lineHeight: 1 }}>
                  {pillar.score}
                </div>
                <div className="font-cormorant muted">{pillar.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card" style={{ padding: 18 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>
            REPUTATION
          </div>
          {[
            ["Trust Score", trustScore.toString()],
            ["Check-in Reliability", `${reliability}%`],
            ["Karma Completion", `${Math.max(55, Math.min(98, lifeScore.discipline))}%`],
            ["Active Circles", "1"],
            ["Days on SUTRA", dayCount.toString()],
          ].map((row, index) => (
            <div
              key={row[0]}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "9px 0",
                borderBottom: index < 4 ? "1px solid var(--border)" : "none",
              }}
            >
              <span className="font-cormorant" style={{ fontSize: 17, color: "var(--white2)" }}>
                {row[0]}
              </span>
              <span className="font-cinzel" style={{ color: "var(--gold)" }}>
                {row[1]}
              </span>
            </div>
          ))}
        </section>
      </div>

      <section>
        <div className="section-label" style={{ marginBottom: 10, color: "var(--white)" }}>
          {"MILESTONES - \u0909\u092a\u0932\u092c\u094d\u0927\u093f\u092f\u093e\u0901"}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {milestones.map((milestone, index) => (
            <motion.article
              key={milestone.id}
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}
            >
              <div style={{ fontSize: 28 }}>{milestone.icon}</div>
              <div>
                <div className="font-cormorant" style={{ fontSize: 20 }}>
                  {milestone.title}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {formatMilestoneDate(milestone.date)}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}

