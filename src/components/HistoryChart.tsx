"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  day: string;
  value: number | null;
}

interface Props {
  data: DataPoint[];
  color: string;
  title: string;
  unit?: string;
  domain?: [number, number];
}

export default function HistoryChart({
  data,
  color,
  title,
  unit,
  domain = [0, 100],
}: Props) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-neutral-400 text-xs">
        データなし
      </div>
    );
  }

  const values = data.map((d) => d.value).filter((v): v is number => v != null);
  const avg = values.length > 0
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : null;

  const formatted = data.map((d) => ({
    label: d.day.slice(5),
    value: d.value,
  }));

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xs font-semibold text-neutral-500">{title}</h3>
        {avg != null && (
          <span className="text-[10px] text-neutral-400 font-mono">
            平均 {avg}
            {unit ?? ""}
          </span>
        )}
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formatted}
            margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
          >
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "#a3a3a3" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={domain}
              tick={{ fontSize: 10, fill: "#a3a3a3" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.06)",
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(8px)",
                fontSize: "11px",
              }}
              formatter={(v: number) => [`${v}${unit ?? ""}`, title]}
            />
            {avg != null && (
              <ReferenceLine
                y={avg}
                stroke={color}
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${title})`}
              dot={false}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
