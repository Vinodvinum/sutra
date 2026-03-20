"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import CosmosBackground from "@/components/CosmosBackground";
import { getAuthClient } from "@/lib/firebaseAuth";
import { getDailyLog, getLatestDailyLog, getProfile } from "@/lib/supabase";

interface ProtectedLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  symbol: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "DASHBOARD", symbol: "\u2299", href: "/dashboard" },
  { label: "CIRCLES", symbol: "\u25ce", href: "/circles" },
  { label: "INTEL", symbol: "\u25c8", href: "/intel" },
  { label: "BRAHMA", symbol: "\u2726", href: "/brahma" },
  { label: "FINANCE", symbol: "\u25c7", href: "/finance" },
  { label: "IDENTITY", symbol: "\u25c9", href: "/identity" },
];

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "DASHBOARD", subtitle: "\u2014 \u0915\u0930\u094d\u092e \u092d\u0942\u092e\u093f \u2014" },
  "/circles": { title: "CIRCLES", subtitle: "\u2014 \u0938\u0902\u0918 \u0936\u0915\u094d\u0924\u093f \u2014" },
  "/intel": { title: "INTELLIGENCE", subtitle: "\u2014 \u091c\u094d\u091e\u093e\u0928 \u0926\u0943\u0937\u094d\u091f\u093f \u2014" },
  "/brahma": { title: "BRAHMA AI", subtitle: "\u2014 \u092c\u094d\u0930\u0939\u094d\u092e \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0915 \u2014" },
  "/finance": { title: "FINANCE", subtitle: "\u2014 \u0905\u0930\u094d\u0925 \u0927\u0930\u094d\u092e \u2014" },
  "/identity": { title: "IDENTITY", subtitle: "\u2014 \u0906\u0924\u094d\u092e \u0926\u0930\u094d\u0936\u0928 \u2014" },
};

const formatDateLabel = (): string =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" })
    .format(new Date())
    .toUpperCase();

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("SADHAK");
  const [userEmoji, setUserEmoji] = useState<string>("\u{1F9D8}");
  const [score, setScore] = useState<number>(55);
  const [streak, setStreak] = useState<number>(0);
  const meta = PAGE_META[pathname] ?? PAGE_META["/dashboard"];

  useEffect(() => {
    const auth = getAuthClient();
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/login");
        return;
      }

      void (async () => {
        const today = new Date().toISOString().slice(0, 10);
        const [profile, todayLog, latestLog] = await Promise.all([
          getProfile(firebaseUser.uid),
          getDailyLog(firebaseUser.uid, today),
          getLatestDailyLog(firebaseUser.uid, today),
        ]);

        if (profile) {
          setUserName(profile.name.toUpperCase());
          setUserEmoji(profile.emoji);
        }

        const active = todayLog ?? latestLog;
        if (active) {
          setScore(active.total);
          setStreak(active.streak);
        }
      })();
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <>
      <CosmosBackground />
      <div className="protected-shell">
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="sidebar-om">{"\u0950"}</div>
            <div className="sidebar-logo">SUTRA</div>
            <div className="sidebar-tag">dharma \u00b7 karma \u00b7 moksha</div>
          </div>

          <nav className="side-nav">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`side-link ${active ? "active" : ""}`}>
                  <span>{item.symbol}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-bottom">
            <div className="sidebar-mantra">
              <div className="sidebar-mantra-text">
                {"\u092f\u094b\u0917\u0903 \u0915\u0930\u094d\u092e\u0938\u0941 \u0915\u094c\u0936\u0932\u092e\u094d"}
              </div>
              <div className="sidebar-mantra-source">BHAGAVAD GITA 2.50</div>
            </div>

            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{userEmoji}</div>
              <div>
                <div className="font-cinzel" style={{ fontSize: 10, letterSpacing: 1 }}>
                  {userName}
                </div>
                <div className="font-cormorant muted" style={{ fontStyle: "italic", fontSize: 12 }}>
                  Score {score}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-column">
          <header className="topbar">
            <div>
              <div className="topbar-title">{meta.title}</div>
              <div className="topbar-sub">{meta.subtitle}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="muted" style={{ fontSize: 12 }}>
                {formatDateLabel()}
              </div>
              <div className="streak-pill">{`\u{1F525} ${streak} Day Agni Streak`}</div>
            </div>
          </header>
          <div className="page-content">{children}</div>
        </main>
      </div>
    </>
  );
}

