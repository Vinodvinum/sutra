"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartPoint {
  day: string;
  score: number;
}

interface DashboardFlameChartProps {
  data: ChartPoint[];
}

export default function DashboardFlameChart({ data }: DashboardFlameChartProps) {
  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="day" tick={{ fill: "#574F47", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#574F47", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(212,168,83,0.08)" }}
            contentStyle={{
              background: "#111620",
              border: "1px solid rgba(255,220,130,0.14)",
              borderRadius: 12,
            }}
            labelStyle={{ color: "#A89F94" }}
          />
          <Bar dataKey="score" fill="#D4A853" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
