"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getAuthClient } from "@/lib/firebaseAuth";
import { getFinanceLog, saveFinanceEntry } from "@/lib/supabase";
import { FinanceLog, SavingsGoal } from "@/lib/types";

type Category = "needs" | "wants" | "waste";

const INITIAL_LOG: FinanceLog = {
  needs: 0,
  wants: 0,
  waste: 0,
  total: 0,
  month: new Date().toISOString().slice(0, 7),
  score: 0,
};

const SAVINGS_GOALS: SavingsGoal[] = [
  { id: "goal-1", title: "Emergency Fund", saved: 65000, target: 120000 },
  { id: "goal-2", title: "Laptop Upgrade", saved: 28000, target: 60000 },
  { id: "goal-3", title: "Pilgrimage Reserve", saved: 12000, target: 50000 },
];

const formatInr = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function FinancePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [financeLog, setFinanceLog] = useState<FinanceLog>(INITIAL_LOG);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<Category>("needs");
  const [description, setDescription] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const monthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const refreshFinance = useCallback(async (uid: string): Promise<void> => {
    setLoading(true);
    const log = await getFinanceLog(uid, monthKey);
    setFinanceLog(log ?? { ...INITIAL_LOG, month: monthKey });
    setLoading(false);
  }, [monthKey]);

  useEffect(() => {
    const auth = getAuthClient();
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        setUserId(null);
        router.replace("/login");
        return;
      }

      setUserId(firebaseUser.uid);
      void refreshFinance(firebaseUser.uid);
    });

    return () => unsubscribe();
  }, [refreshFinance, router]);

  const percentages = useMemo(() => {
    if (financeLog.total <= 0) {
      return { needs: 0, wants: 0, waste: 0 };
    }

    return {
      needs: Math.round((financeLog.needs / financeLog.total) * 100),
      wants: Math.round((financeLog.wants / financeLog.total) * 100),
      waste: Math.round((financeLog.waste / financeLog.total) * 100),
    };
  }, [financeLog]);

  const addEntry = async (): Promise<void> => {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setFormError("Please enter a valid amount.");
      return;
    }

    if (!userId) {
      setFormError("Please sign in to save entry.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const today = new Date().toISOString().slice(0, 10);
      await saveFinanceEntry(userId, today, numeric, category, description.trim());
      await refreshFinance(userId);
      setAmount("");
      setDescription("");
      setCategory("needs");
      setOpen(false);
    } catch {
      setFormError("Unable to save entry right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="grid-2">
        <section className="glass-card" style={{ padding: 22, position: "relative", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: -70,
              left: -50,
              width: 170,
              height: 170,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(78,143,212,0.25), transparent 70%)",
            }}
          />
          <div className="section-label" style={{ color: "var(--blue)", marginBottom: 8 }}>
            FINANCE SCORE
          </div>
          <div className="font-cinzel" style={{ fontSize: 52, color: "var(--blue)", lineHeight: 1 }}>
            {financeLog.score}
          </div>
          <div className="font-cormorant" style={{ fontSize: 20, color: "var(--white2)", fontStyle: "italic" }}>
            Artha Discipline
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {[
              ["needs", "\u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e", "var(--green)"],
              ["wants", "\u0907\u091a\u094d\u091b\u093e", "var(--gold)"],
              ["waste", "\u0935\u094d\u092f\u0930\u094d\u0925", "var(--red)"],
            ].map((row) => {
              const key = row[0] as Category;
              return (
                <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: row[2],
                      }}
                    />
                    <span>
                      <span className="font-cormorant" style={{ fontSize: 16 }}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <span className="font-cormorant muted" style={{ marginLeft: 8, fontStyle: "italic", fontSize: 12 }}>
                        {row[1]}
                      </span>
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="font-cinzel" style={{ fontSize: 15 }}>
                      {formatInr(financeLog[key])}
                    </div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {percentages[key]}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="track" style={{ marginTop: 14, display: "flex", height: 8 }}>
            <div style={{ width: `${percentages.needs}%`, background: "var(--green)" }} />
            <div style={{ width: `${percentages.wants}%`, background: "var(--gold)" }} />
            <div style={{ width: `${percentages.waste}%`, background: "var(--red)" }} />
          </div>

          {loading ? (
            <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
              Syncing monthly finance log...
            </div>
          ) : null}
        </section>

        <section className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="section-label">SAVINGS - {"\u0938\u0902\u091a\u092f"}</div>
            <button className="font-dm" style={{ border: "none", background: "none", color: "var(--gold)", cursor: "pointer" }}>
              + Add Goal
            </button>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {SAVINGS_GOALS.map((goal) => {
              const ratio = Math.min(1, goal.saved / goal.target);
              return (
                <article key={goal.id} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div className="font-cormorant" style={{ fontSize: 20 }}>
                      {goal.title}
                    </div>
                    <div className="font-cinzel" style={{ color: "var(--blue)" }}>
                      {Math.round(ratio * 100)}%
                    </div>
                  </div>
                  <div className="track" style={{ marginBottom: 8 }}>
                    <div
                      className="progress"
                      style={{
                        width: `${Math.max(4, ratio * 100)}%`,
                        background: "linear-gradient(90deg, var(--blue), var(--teal))",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {formatInr(goal.saved)} saved
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      Target {formatInr(goal.target)}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <section
        className="glass-card"
        style={{
          padding: 18,
          borderColor: "rgba(212,168,83,0.16)",
          background: "linear-gradient(135deg, rgba(212,168,83,0.07), rgba(212,168,83,0.02))",
        }}
      >
        <div className="section-label" style={{ color: "var(--gold)", marginBottom: 6 }}>
          BRAHMA INSIGHT
        </div>
        <div className="font-cormorant" style={{ fontSize: 16, color: "var(--white2)" }}>
          Your Artha rises when wants stay below one-third of total spend. Protect savings first,
          then spend with intention.
        </div>
      </section>

      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 26,
          bottom: 24,
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "none",
          background: "var(--gold)",
          color: "var(--bg)",
          fontSize: 24,
          cursor: "pointer",
          zIndex: 12,
        }}
      >
        +
      </button>

      {open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          <div className="glass-card" style={{ width: "min(620px, 100%)", borderRadius: "22px 22px 0 0", padding: 20 }}>
            <div className="section-label" style={{ color: "var(--gold)", marginBottom: 10 }}>
              ADD ENTRY
            </div>
            <div className="auth-input-group">
              <label className="auth-label">Amount</label>
              <input
                className="auth-input"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
              />
            </div>
            <div className="auth-label">Category</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {(["needs", "wants", "waste"] as Category[]).map((entry) => (
                <button
                  key={entry}
                  onClick={() => setCategory(entry)}
                  style={{
                    border: `1px solid ${category === entry ? "var(--gold)" : "var(--border2)"}`,
                    background: category === entry ? "var(--golddim)" : "var(--surface)",
                    color: category === entry ? "var(--gold)" : "var(--white2)",
                    borderRadius: 12,
                    padding: "10px 14px",
                    textTransform: "capitalize",
                    flex: 1,
                    cursor: "pointer",
                  }}
                >
                  {entry}
                </button>
              ))}
            </div>
            <div className="auth-input-group">
              <label className="auth-label">Description</label>
              <input
                className="auth-input"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional note"
              />
            </div>
            {formError ? <div className="auth-error">{formError}</div> : null}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="gold-btn outline" onClick={() => setOpen(false)}>
                CANCEL
              </button>
              <button className="gold-btn primary" onClick={() => void addEntry()} disabled={saving}>
                {saving ? "PROCESSING..." : "SAVE ENTRY"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

