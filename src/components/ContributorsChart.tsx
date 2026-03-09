"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  data: { label: string; value: number | null }[];
  color: string;
  title: string;
}

export default function ContributorsChart({ data, color, title }: Props) {
  const chartData = data
    .filter((d) => d.value != null)
    .map((d) => ({ subject: d.label, value: d.value! }));

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-neutral-400 text-xs">
        データなし
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-neutral-500 mb-2">{title}</h3>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(0,0,0,0.06)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fill: "#737373" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.06)",
                background: "rgba(255,255,255,0.9)",
                fontSize: "11px",
              }}
            />
            <Radar
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
