"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AuthInput from "@/components/AuthInput";
import CosmosBackground from "@/components/CosmosBackground";
import GoldButton from "@/components/GoldButton";
import { getAuthClient } from "@/lib/firebaseAuth";
import { getSupabaseClient } from "@/lib/supabase";

type PillarKey = "discipline" | "health" | "finance" | "growth";

interface PillarOption {
  key: PillarKey;
  name: string;
  sanskrit: string;
  icon: string;
}

const PILLARS: PillarOption[] = [
  { key: "discipline", name: "TAPAS", sanskrit: "Discipline", icon: "\u{1F531}" },
  { key: "health", name: "\u0100ROGYA", sanskrit: "Health", icon: "\u{1F49A}" },
  { key: "finance", name: "ARTHA", sanskrit: "Finance", icon: "\u{1F4AB}" },
  { key: "growth", name: "VIDY\u0100", sanskrit: "Growth", icon: "\u{1FAB7}" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [goal1, setGoal1] = useState<string>("");
  const [goal2, setGoal2] = useState<string>("");
  const [goal3, setGoal3] = useState<string>("");
  const [selected, setSelected] = useState<PillarKey[]>(["discipline", "health"]);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useMemo(() => getAuthClient(), []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const togglePillar = (pillar: PillarKey): void => {
    setSelected((previous) => {
      if (previous.includes(pillar)) {
        if (previous.length <= 2) {
          return previous;
        }

        return previous.filter((entry) => entry !== pillar);
      }

      return [...previous, pillar];
    });
  };

  const handleGoalsStep = async (): Promise<void> => {
    if (!goal1.trim()) {
      setError("Please enter your primary mission.");
      return;
    }

    if (selected.length < 2) {
      setError("Please select at least 2 pillars.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/login");
        return;
      }

      const supabase = getSupabaseClient();
      await supabase.from("profiles").upsert({
        id: user.uid,
        name: user.displayName ?? "Sadhak",
        avatar_emoji: "\u{1F9D8}",
        goals: [goal1, goal2, goal3].filter(Boolean),
        selected_pillars: selected,
        onboarding_complete: false,
      });

      setStep(2);
    } catch {
      setError("Unable to save goals right now.");
    } finally {
      setSaving(false);
    }
  };

  const finishOnboarding = async (): Promise<void> => {
    setSaving(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/login");
        return;
      }

      const supabase = getSupabaseClient();
      await supabase
        .from("profiles")
        .update({ onboarding_complete: true, baseline_complete: true })
        .eq("id", user.uid);
      router.push("/dashboard");
    } catch {
      setError("Unable to complete onboarding.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CosmosBackground />
      <div className="auth-shell">
        <section className="auth-left">
          <div className="auth-brand">
            <span className="auth-brand-om">{"\u0950"}</span>
            <div>
              <div className="auth-brand-name">SUTRA</div>
              <div className="auth-brand-tag">dharma \u2022 karma \u2022 moksha</div>
            </div>
          </div>

          <div className="auth-left-scroll">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: step === 1 ? "var(--gold)" : "var(--green)",
                }}
              />
              <span style={{ flex: 1, height: 1, background: "var(--border2)" }} />
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: step === 2 ? "var(--gold)" : "var(--border2)",
                }}
              />
            </div>

            {step === 1 ? (
              <>
                <h1 className="auth-title">
                  YOUR DHARMA
                  <br />
                  GOALS
                </h1>
                <p className="auth-subtitle">What are you here to master?</p>

                <AuthInput
                  label="Goal 1 - Primary Mission"
                  placeholder="e.g. Build unbreakable discipline"
                  value={goal1}
                  onChange={setGoal1}
                  required
                />
                <AuthInput
                  label="Goal 2 - Second Focus"
                  placeholder="e.g. Reach financial freedom"
                  value={goal2}
                  onChange={setGoal2}
                />
                <AuthInput
                  label="Goal 3 - Third Commitment"
                  placeholder="e.g. Master a new skill"
                  value={goal3}
                  onChange={setGoal3}
                />

                <div className="auth-label" style={{ marginTop: 10 }}>
                  SELECT YOUR PILLARS
                </div>
                <div className="muted" style={{ fontSize: 11, marginBottom: 12 }}>
                  Choose at least 2
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  {PILLARS.map((pillar) => {
                    const isSelected = selected.includes(pillar.key);
                    return (
                      <button
                        key={pillar.key}
                        onClick={() => togglePillar(pillar.key)}
                        style={{
                          borderRadius: 14,
                          border: `1px solid ${isSelected ? "var(--gold)" : "var(--border2)"}`,
                          background: isSelected ? "var(--golddim)" : "var(--surface)",
                          color: isSelected ? "var(--gold)" : "var(--white3)",
                          padding: "15px 10px",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: 22 }}>{pillar.icon}</div>
                        <div className="font-cinzel" style={{ fontSize: 10, letterSpacing: 1.5 }}>
                          {pillar.name}
                        </div>
                        <div className="font-cormorant" style={{ fontStyle: "italic", fontSize: 13 }}>
                          {pillar.sanskrit}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {error ? <div className="auth-error">{error}</div> : null}
                <GoldButton
                  title="NEXT - BASELINE WEEK"
                  loading={saving}
                  onClick={() => void handleGoalsStep()}
                />
              </>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <div style={{ fontSize: 40, color: "var(--gold)" }}>{"\u0950"}</div>
                  <div className="font-cinzel" style={{ fontSize: 18, letterSpacing: 3 }}>
                    THE WATCHING WEEK
                  </div>
                  <div className="font-cormorant" style={{ fontStyle: "italic", color: "var(--white3)" }}>
                    {"\u092a\u0930\u094d\u092f\u0935\u0947\u0915\u094d\u0937\u0923 \u0915\u093e\u0932"}
                  </div>
                  <div
                    className="font-cinzel"
                    style={{ fontSize: 86, color: "var(--gold)", lineHeight: 1, marginTop: 6 }}
                  >
                    7
                  </div>
                  <div className="font-cinzel" style={{ fontSize: 10, letterSpacing: 3, color: "var(--white3)" }}>
                    DAYS OF SILENCE
                  </div>
                </div>

                <p
                  className="font-cormorant"
                  style={{
                    fontStyle: "italic",
                    color: "var(--white2)",
                    fontSize: 15,
                    lineHeight: 1.8,
                    marginBottom: 16,
                  }}
                >
                  SUTRA will observe your patterns silently for 7 days before calculating your first
                  Life Score.
                </p>

                {[
                  ["\u{1F531}", "Discipline patterns", "task completion, focus time"],
                  ["\u{1F49A}", "Sleep and movement", "hours, consistency, exercise"],
                  ["\u{1F4AB}", "Spending behavior", "needs, wants, waste"],
                  ["\u{1FAB7}", "Learning habits", "reading, courses, reflection"],
                ].map((item) => (
                  <div
                    key={item[1]}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 13,
                      padding: "12px 14px",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontSize: 18 }}>{item[0]}</div>
                    <div>
                      <div className="font-cormorant" style={{ fontSize: 15 }}>
                        {item[1]}
                      </div>
                      <div className="font-cormorant muted" style={{ fontStyle: "italic", fontSize: 13 }}>
                        {item[2]}
                      </div>
                    </div>
                  </div>
                ))}

                {error ? <div className="auth-error">{error}</div> : null}
                <div style={{ marginTop: 16 }}>
                  <GoldButton
                    title="I UNDERSTAND - BEGIN \u2726"
                    loading={saving}
                    onClick={() => void finishOnboarding()}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="auth-right">
          <div style={{ textAlign: "center", maxWidth: 360 }}>
            <div
              style={{
                color: "var(--gold)",
                fontSize: 52,
                filter: "drop-shadow(0 0 18px rgba(212,168,83,0.65))",
              }}
            >
              {"\u0950"}
            </div>
            <p className="font-cormorant" style={{ fontStyle: "italic", color: "var(--gold2)", fontSize: 22 }}>
              {"\"\u0938\u094d\u0935\u0927\u0930\u094d\u092e\u0947 \u0928\u093f\u0927\u0928\u0902 \u0936\u094d\u0930\u0947\u092f\u0903\""}
            </p>
            <p className="font-cormorant" style={{ fontStyle: "italic", color: "var(--white2)" }}>
              Better to live your own dharma imperfectly than another&apos;s perfectly.
            </p>
            <p className="font-cinzel muted" style={{ fontSize: 9, letterSpacing: 2 }}>
              BHAGAVAD GITA 3.35
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
