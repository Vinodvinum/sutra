"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AuthInput from "@/components/AuthInput";
import CosmosBackground from "@/components/CosmosBackground";
import GoldButton from "@/components/GoldButton";
import { signInWithGoogle, signUpWithEmail } from "@/lib/firebaseAuth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const validate = (): string | null => {
    if (!name.trim()) {
      return "Please enter your full name.";
    }

    if (!email.includes("@")) {
      return "Please enter a valid email address.";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };

  const handleSignup = async (): Promise<void> => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await signUpWithEmail(email.trim(), password, name.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/onboarding");
  };

  const handleGoogleSignup = async (): Promise<void> => {
    setGoogleLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    setGoogleLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/onboarding");
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
              CREATE
              <br />
              ACCOUNT
            </h1>
            <p className="auth-subtitle">
              {"\u0906\u0930\u0902\u092d \u2014 The beginning of discipline"}
            </p>

            <AuthInput
              label="Full Name"
              placeholder="Your true name"
              value={name}
              onChange={setName}
              required
            />
            <AuthInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChange={setEmail}
              type="email"
              required
            />
            <AuthInput
              label="Password"
              placeholder="Min 8 characters"
              value={password}
              onChange={setPassword}
              type="password"
              required
            />
            <AuthInput
              label="Confirm Password"
              placeholder="Repeat your key"
              value={confirmPassword}
              onChange={setConfirmPassword}
              type="password"
              required
            />

            <GoldButton title="CREATE ACCOUNT" loading={loading} onClick={() => void handleSignup()} />

            {error ? <div className="auth-error">{error}</div> : null}

            <div className="auth-divider">or</div>

            <button className="auth-google" onClick={() => void handleGoogleSignup()} disabled={googleLoading}>
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
              {googleLoading ? "PROCESSING..." : "Sign up with Google"}
            </button>

            <div className="auth-link-row">
              Already have an account?{" "}
              <Link href="/login" className="auth-link">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <aside className="auth-right">
          <div style={{ width: "100%", maxWidth: 360 }}>
            <div
              className="font-cinzel"
              style={{
                fontSize: 10,
                letterSpacing: 3,
                color: "var(--white3)",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              YOUR JOURNEY IN 4 STEPS
            </div>
            <div style={{ display: "grid", gap: 18 }}>
              {[
                ["1", "CREATE ACCOUNT", "Set up your sacred identity"],
                ["2", "SET YOUR GOALS", "Define what you are here to master"],
                ["3", "7 DAY BASELINE", "SUTRA observes your patterns silently"],
              ].map((step) => (
                <div key={step[0]} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div
                    className="font-cinzel"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      border: "1px solid var(--border2)",
                      background: "var(--golddim)",
                      color: "var(--gold)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {step[0]}
                  </div>
                  <div>
                    <div className="feature-title">{step[1]}</div>
                    <div className="feature-desc">{step[2]}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  className="font-cinzel"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: "1px solid var(--gold)",
                    background: "linear-gradient(135deg, var(--gold), var(--gold2))",
                    color: "var(--bg)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {"\u2726"}
                </div>
                <div>
                  <div className="feature-title" style={{ color: "var(--gold)" }}>
                    LIFE SCORE REVEALED
                  </div>
                  <div className="feature-desc">The dharmic journey begins</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
