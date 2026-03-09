"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SleepStage {
  day: string;
  deep: number;
  rem: number;
  light: number;
  awake: number;
}

interface Props {
  data: SleepStage[];
}

function minToHr(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? `${m}m` : ""}` : `${m}m`;
}

export default function SleepStagesChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
        データなし
      </div>
    );
  }

  const formatted = data.map((d) => ({
    label: d.day.slice(5),
    深い睡眠: Math.round(d.deep / 60),
    REM: Math.round(d.rem / 60),
    浅い睡眠: Math.round(d.light / 60),
    覚醒: Math.round(d.awake / 60),
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            unit="m"
          />
          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              background: "#fff",
              fontSize: "11px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
            formatter={(value: number) => [`${minToHr(value)}`, undefined]}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={8} />
          <Bar dataKey="深い睡眠" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="REM" stackId="a" fill="#8b5cf6" />
          <Bar dataKey="浅い睡眠" stackId="a" fill="#93c5fd" />
          <Bar dataKey="覚醒" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
