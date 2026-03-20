"use client";

import Link from "next/link";
import { useState } from "react";

import AuthInput from "@/components/AuthInput";
import CosmosBackground from "@/components/CosmosBackground";
import GoldButton from "@/components/GoldButton";
import { resetPassword } from "@/lib/firebaseAuth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleReset = async (): Promise<void> => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    const result = await resetPassword(email.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
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
            <Link href="/login" className="auth-back">
              {"\u2190"} BACK TO LOGIN
            </Link>
            <h1 className="auth-title">
              RESET
              <br />
              YOUR PATH
            </h1>
            <p className="auth-subtitle">We will send a reset link to your email.</p>

            {success ? (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>{"\u2709\ufe0f"}</div>
                <div
                  className="font-cinzel"
                  style={{ color: "var(--green)", fontSize: 18, letterSpacing: 2, marginBottom: 8 }}
                >
                  LINK SENT
                </div>
                <div className="font-cormorant" style={{ fontStyle: "italic", color: "var(--white2)" }}>
                  Check your inbox. The reset link will guide you back to your path.
                </div>
                <div style={{ marginTop: 18 }}>
                  <Link href="/login">
                    <GoldButton title="BACK TO LOGIN" onClick={() => undefined} outline />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <AuthInput
                  label="Email Address"
                  placeholder="your@email.com"
                  value={email}
                  onChange={setEmail}
                  type="email"
                />

                <GoldButton title="SEND RESET LINK" loading={loading} onClick={() => void handleReset()} />
                {error ? <div className="auth-error">{error}</div> : null}
              </>
            )}
          </div>
        </section>

        <aside className="auth-right">
          <div style={{ textAlign: "center", maxWidth: 360 }}>
            <div
              style={{
                color: "var(--gold)",
                fontSize: 50,
                marginBottom: 20,
                filter: "drop-shadow(0 0 18px rgba(212,168,83,0.65))",
              }}
            >
              {"\u0950"}
            </div>
            <div className="font-cormorant" style={{ fontSize: 24, color: "var(--gold2)", fontStyle: "italic" }}>
              {"\"\\u092e\\u0928 \\u090f\\u0935 \\u092e\\u0928\\u0941\\u0937\\u094d\\u092f\\u093e\\u0923\\u093e\\u0902\""}
            </div>
            <div className="font-cormorant" style={{ fontStyle: "italic", color: "var(--white2)", marginTop: 8 }}>
              The mind alone is the cause of bondage and liberation.
            </div>
            <div className="font-cinzel" style={{ fontSize: 9, letterSpacing: 2, color: "var(--white3)", marginTop: 10 }}>
              AMRITABINDU UPANISHAD 2
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
