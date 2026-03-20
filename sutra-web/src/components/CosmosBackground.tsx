"use client";

import { useEffect, useRef } from "react";

interface NebulaConfig {
  left: string;
  top: string;
  size: number;
  tone: "gold" | "sacred";
  duration: string;
}

const NEBULA_CONFIGS: NebulaConfig[] = [
  { left: "6%", top: "10%", size: 180, tone: "gold", duration: "13s" },
  { left: "28%", top: "74%", size: 210, tone: "sacred", duration: "18s" },
  { left: "68%", top: "14%", size: 220, tone: "gold", duration: "20s" },
  { left: "82%", top: "66%", size: 170, tone: "sacred", duration: "15s" },
  { left: "44%", top: "42%", size: 130, tone: "gold", duration: "14s" },
  { left: "58%", top: "82%", size: 190, tone: "sacred", duration: "22s" },
];

export default function CosmosBackground() {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = starsRef.current;
    if (!parent) {
      return;
    }

    parent.innerHTML = "";

    for (let index = 0; index < 80; index += 1) {
      const star = document.createElement("span");
      star.className = "cosmos-star";
      const size = Math.floor(Math.random() * 3) + 1;
      const opacity = (Math.random() * 0.7 + 0.2).toFixed(2);
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.opacity = opacity;
      star.style.setProperty("--dur", `${Math.floor(Math.random() * 4) + 2}s`);
      star.style.setProperty("--del", `${Math.floor(Math.random() * 4)}s`);
      parent.appendChild(star);
    }

    return () => {
      parent.innerHTML = "";
    };
  }, []);

  return (
    <div className="cosmos-root" aria-hidden>
      <div ref={starsRef} className="cosmos-stars" />
      {NEBULA_CONFIGS.map((nebula, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={`nebula-${index}`}
          className={`cosmos-nebula ${nebula.tone}`}
          style={{
            left: nebula.left,
            top: nebula.top,
            width: `${nebula.size}px`,
            height: `${nebula.size}px`,
            ["--dur" as string]: nebula.duration,
          }}
        />
      ))}
    </div>
  );
}
