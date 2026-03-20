"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AuthInput from "@/components/AuthInput";
import CosmosBackground from "@/components/CosmosBackground";
import GoldButton from "@/components/GoldButton";
import { getSupabaseClient } from "@/lib/supabase";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebaseAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const goToNextStep = async (userId: string): Promise<void> => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", userId)
      .maybeSingle();

    if (data?.onboarding_complete) {
      router.push("/dashboard");
      return;
    }

    router.push("/onboarding");
  };

  const handleEmailLogin = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);
    const result = await signInWithEmail(email.trim(), password);
    setLoading(false);

    if (result.error || !result.user) {
      setError(result.error ?? "Unable to sign in.");
      return;
    }

    await goToNextStep(result.user.uid);
  };

  const handleGoogleLogin = async (): Promise<void> => {
    setGoogleLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    setGoogleLoading(false);

    if (result.error || !result.user) {
      setError(result.error ?? "Google sign-in failed.");
      return;
    }

    await goToNextStep(result.user.uid);
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
            <Link href="/" className="auth-back">
              {"\u2190"} BACK
            </Link>
            <h1 className="auth-title">
              WELCOME
              <br />
              BACK
            </h1>
            <p className="auth-subtitle">
              {"\u092a\u0941\u0928\u0930\u093e\u0917\u092e\u0928 \u2014 Return to the path"}
            </p>

            <AuthInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChange={setEmail}
              type="email"
            />
            <AuthInput
              label="Password"
              placeholder="Your sacred key"
              value={password}
              onChange={setPassword}
              type="password"
            />

            <div style={{ textAlign: "right", marginBottom: 12 }}>
              <Link className="auth-link" href="/forgot-password">
                Forgot Password?
              </Link>
            </div>

            <GoldButton title="SIGN IN TO SUTRA" loading={loading} onClick={() => void handleEmailLogin()} />

            {error ? <div className="auth-error">{error}</div> : null}

            <div className="auth-divider">or continue with</div>

            <button className="auth-google" onClick={() => void handleGoogleLogin()} disabled={googleLoading}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "white",
                  color: "#4285F4",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                G
              </span>
              {googleLoading ? "PROCESSING..." : "Continue with Google"}
            </button>

            <div className="auth-link-row">
              New to SUTRA?{" "}
              <Link href="/signup" className="auth-link">
                Create your account
              </Link>
            </div>
          </div>
        </section>

        <aside className="auth-right">
          <div style={{ width: "100%", maxWidth: 380 }}>
            <div
              style={{
                textAlign: "center",
                color: "var(--gold)",
                fontSize: 52,
                marginBottom: 24,
                filter: "drop-shadow(0 0 18px rgba(212,168,83,0.65))",
              }}
            >
              {"\u0950"}
            </div>
            <div className="feature-stack">
              <div className="feature-card">
                <div style={{ fontSize: 20 }}>{"\u2299"}</div>
                <div>
                  <div className="feature-title">LIFE SCORE</div>
                  <div className="feature-desc">
                    One number for discipline, health, finance, and growth.
                  </div>
                </div>
              </div>
              <div className="feature-card">
                <div style={{ fontSize: 20 }}>{"\u25ce"}</div>
                <div>
                  <div className="feature-title">SACRED CIRCLES</div>
                  <div className="feature-desc">Silent accountability with your chosen people.</div>
                </div>
              </div>
              <div className="feature-card">
                <div style={{ fontSize: 20 }}>{"\u2726"}</div>
                <div>
                  <div className="feature-title">BRAHMA AI</div>
                  <div className="feature-desc">Wisdom from Gita and Chanakya, based on your data.</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
