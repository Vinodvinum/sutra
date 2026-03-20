"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { getAuthClient } from "@/lib/firebaseAuth";
import { getDailyLog, getLatestDailyLog } from "@/lib/supabase";
import { ChatMessage, LifeScore } from "@/lib/types";

const SUGGESTIONS = [
  "Why is my score dropping?",
  "How to fix my sleep?",
  "Best time to study today?",
  "My finance review",
  "Give me a mantra for today",
] as const;

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

const makeId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const getTodayIso = (): string => new Date().toISOString().slice(0, 10);

export default function BrahmaPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: "ai",
      text: "Namaste. Ask with sincerity, and we will align your karma with clarity.",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [thinking, setThinking] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [lifeScore, setLifeScore] = useState<LifeScore>(FALLBACK_SCORE);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

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
      const today = getTodayIso();
      const todayLog = await getDailyLog(userId, today);
      if (todayLog) {
        setLifeScore(todayLog);
        return;
      }

      const previous = await getLatestDailyLog(userId, today);
      if (previous) {
        setLifeScore(previous);
      }
    })();
  }, [userId]);

  const submitMessage = async (text: string): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed || thinking) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { id: makeId(), role: "user", text: trimmed }];
    setMessages(nextMessages);
    setThinking(true);

    try {
      const response = await fetch("/api/brahma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, lifeScore }),
      });

      const data = (await response.json()) as { response?: string };
      const aiText = data.response ?? "Agni is unstable now. Ask again in a moment.";
      setMessages((previous) => [...previous, { id: makeId(), role: "ai", text: aiText }]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          id: makeId(),
          role: "ai",
          text: "Agni is unstable now. Ask again in a moment.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const scoreMeta = useMemo(
    () => `Score ${lifeScore.total} · Tapas ${lifeScore.discipline} · Agni ${lifeScore.streak}d`,
    [lifeScore.discipline, lifeScore.streak, lifeScore.total]
  );

  return (
    <div className="glass-card" style={{ minHeight: "calc(100vh - 140px)", padding: 18, display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: 12 }}>
        <div className="font-cinzel" style={{ letterSpacing: 2, fontSize: 20 }}>
          {"\u{1F531} BRAHMA AI"}
        </div>
        <div className="font-cormorant muted" style={{ fontStyle: "italic", fontSize: 16 }}>
          Your intelligent life guide
        </div>
        <div className="font-cinzel" style={{ marginTop: 5, fontSize: 8, letterSpacing: 1.5, color: "var(--gold)" }}>
          {scoreMeta}
        </div>
      </div>

      <div className="chip-row" style={{ marginBottom: 12 }}>
        {SUGGESTIONS.map((suggestion) => (
          <button key={suggestion} className="chip" onClick={() => void submitMessage(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", paddingRight: 4 }}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            className="chat-msg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex",
              gap: 10,
              justifyContent: message.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 14,
            }}
          >
            {message.role === "ai" ? (
              <>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid var(--border2)",
                    background: "var(--golddim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {"\u{1F531}"}
                </div>
                <div style={{ maxWidth: "72%" }}>
                  <div className="font-cinzel" style={{ color: "var(--gold)", fontSize: 8, letterSpacing: 2, marginBottom: 5 }}>
                    BRAHMA
                  </div>
                  <div
                    className="font-cormorant"
                    style={{
                      borderRadius: "4px 18px 18px 18px",
                      border: "1px solid var(--border2)",
                      background: "var(--surface)",
                      padding: "12px 14px",
                      color: "var(--white2)",
                      fontSize: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className="font-dm"
                  style={{
                    maxWidth: "72%",
                    borderRadius: "18px 4px 18px 18px",
                    border: "1px solid var(--border2)",
                    background: "var(--golddim)",
                    padding: "10px 13px",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {message.text}
                </div>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    background: "var(--surface2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {"\u{1F9D8}"}
                </div>
              </>
            )}
          </motion.div>
        ))}

        {thinking ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid var(--border2)",
                background: "var(--golddim)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {"\u{1F531}"}
            </div>
            <div
              style={{
                borderRadius: "4px 18px 18px 18px",
                border: "1px solid var(--border2)",
                background: "var(--surface)",
                padding: "12px 16px",
                display: "flex",
                gap: 6,
              }}
            >
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={`thinking-dot-${index}`}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--gold)" }}
                  animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.9, delay: index * 0.2 }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          marginTop: 8,
          borderTop: "1px solid var(--border)",
          paddingTop: 12,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <textarea
          className="font-dm"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submitMessage(input);
              setInput("");
            }
          }}
          placeholder="Ask Brahma..."
          style={{
            flex: 1,
            minHeight: 44,
            maxHeight: 90,
            border: "1px solid var(--border2)",
            borderRadius: 14,
            background: "var(--surface)",
            color: "var(--white)",
            padding: "11px 14px",
            resize: "none",
            outline: "none",
          }}
        />
        <button
          onClick={() => {
            void submitMessage(input);
            setInput("");
          }}
          disabled={!input.trim() || thinking}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            background: "var(--gold)",
            color: "var(--bg)",
            fontSize: 18,
            cursor: !input.trim() || thinking ? "not-allowed" : "pointer",
            opacity: !input.trim() || thinking ? 0.5 : 1,
          }}
        >
          {"\u2191"}
        </button>
      </div>
    </div>
  );
}

