"use client";

import {
  AreaChart,
  Area,
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
  label: string;
  color: string;
}

export default function TrendChart({ data, label, color }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-slate-400 text-xs">
        データなし
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: d.day.slice(5),
  }));

  return (
    <div>
      {label && (
        <h4 className="text-xs text-slate-400 font-medium mb-2">{label}</h4>
      )}
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formatted}
            margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
          >
            <defs>
              <linearGradient id={`trend-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.12} />
                <stop offset="100%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                fontSize: "11px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            />
            <Area
              type="monotone"
              dataKey="sleep"
              stroke={color}
              strokeWidth={2}
              fill={`url(#trend-${label})`}
              dot={{ r: 2.5, fill: color }}
              name="睡眠"
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="readiness"
              stroke={`${color}88`}
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4 3"
              dot={{ r: 2, fill: `${color}88` }}
              name="回復"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
