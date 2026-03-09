"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface TrendPoint {
  day: string;
  sleep: number | null;
  readiness: number | null;
}

interface TrendChartProps {
  data: TrendPoint[];
}

export default function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-neutral-400 text-sm">
        No trend data available
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: d.day.slice(5), // MM-DD
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#a3a3a3" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#a3a3a3" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e5e5",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              fontSize: "13px",
            }}
          />
          <Line
            type="monotone"
            dataKey="sleep"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: "#6366f1" }}
            name="Sleep"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="readiness"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 3, fill: "#22c55e" }}
            name="Readiness"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
