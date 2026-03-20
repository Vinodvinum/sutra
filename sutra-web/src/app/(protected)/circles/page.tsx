"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAuthClient } from "@/lib/firebaseAuth";
import { mockCircles } from "@/lib/mockData";
import { getCircles } from "@/lib/supabase";
import { Circle } from "@/lib/types";

const trustColor = (value: number): string => {
  if (value >= 80) {
    return "var(--gold)";
  }
  if (value >= 60) {
    return "var(--white2)";
  }
  return "var(--red)";
};

export default function CirclesPage() {
  const router = useRouter();
  const [circles, setCircles] = useState<Circle[]>(mockCircles);
  const [showSent, setShowSent] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuthClient();
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/login");
        return;
      }

      void (async () => {
        const rows = await getCircles(firebaseUser.uid);
        if (rows.length > 0) {
          setCircles(rows);
        }
      })();
    });

    return () => unsubscribe();
  }, [router]);

  const triggerSOS = (): void => {
    const confirmed = window.confirm("Send dharma support signal to your circle?");
    if (!confirmed) {
      return;
    }

    setShowSent(true);
    window.setTimeout(() => setShowSent(false), 2200);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section>
        <h2 className="font-cinzel" style={{ fontSize: 22, letterSpacing: 2 }}>
          CIRCLES
        </h2>
        <p className="font-cormorant muted" style={{ fontStyle: "italic", fontSize: 16 }}>
          Sacred accountability
        </p>
      </section>

      {circles.map((circle) => (
        <article key={circle.id} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
          <header
            style={{
              padding: "18px 22px 14px",
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--border)",
              background: "linear-gradient(135deg, rgba(212,168,83,0.05), transparent)",
            }}
          >
            <div>
              <div className="font-cinzel" style={{ fontSize: 18 }}>
                {circle.name}
              </div>
              <div className="font-cormorant muted" style={{ fontStyle: "italic", fontSize: 13 }}>
                {circle.members.length} members · {circle.daysTogether} days
              </div>
            </div>
            <div
              className="font-cinzel"
              style={{
                padding: "6px 14px",
                borderRadius: 12,
                border: "1px solid var(--border2)",
                background: "var(--golddim)",
                color: "var(--gold)",
                fontSize: 12,
              }}
            >
              Avg {circle.avgScore}
            </div>
          </header>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "42px 1fr 90px 60px 70px 70px",
              gap: 10,
              padding: "10px 22px",
              borderBottom: "1px solid var(--border)",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            {["", "Member", "Streak", "Check", "Score", "Trust"].map((label) => (
              <div key={label} className="font-cinzel muted" style={{ fontSize: 8, letterSpacing: 1.5 }}>
                {label}
              </div>
            ))}
          </div>

          {circle.members.map((member) => (
            <div
              key={member.id}
              style={{
                display: "grid",
                gridTemplateColumns: "42px 1fr 90px 60px 70px 70px",
                gap: 10,
                padding: "12px 22px",
                borderBottom: "1px solid var(--border)",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--surface2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {member.emoji}
              </div>
              <div>
                <div style={{ fontSize: 14 }}>{member.name}</div>
                <div className="font-cormorant muted" style={{ fontStyle: "italic", fontSize: 11 }}>
                  {member.role}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--white2)", textAlign: "center" }}>
                {member.streak > 0 ? `\u{1F525} ${member.streak}d` : `\u{1F494} ${Math.abs(member.streak)}d`}
              </div>
              <div style={{ textAlign: "center", fontSize: 17 }}>
                {member.checkedIn ? "\u2705" : "\u274c"}
              </div>
              <div className="font-cinzel muted" style={{ textAlign: "center", fontSize: 13 }}>
                {member.lifeScore}
              </div>
              <div className="font-cinzel" style={{ textAlign: "center", fontSize: 14, color: trustColor(member.trustScore) }}>
                {member.trustScore}
              </div>
            </div>
          ))}
        </article>
      ))}

      <button
        onClick={triggerSOS}
        className="glass-card"
        style={{
          background: "rgba(212,92,92,0.06)",
          borderColor: "rgba(212,92,92,0.18)",
          padding: "18px 22px",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div className="font-cinzel" style={{ fontSize: 13, letterSpacing: 1, color: "var(--red)" }}>
          I&apos;M NOT OKAY — DHARMA SUPPORT
        </div>
        <div className="font-cormorant muted" style={{ fontStyle: "italic", marginTop: 4 }}>
          Silent signal to your sacred circle
        </div>
      </button>

      {showSent ? <div className="auth-success">Support signal sent to your circle.</div> : null}
    </div>
  );
}

