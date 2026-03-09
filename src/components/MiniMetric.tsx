"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

interface Props {
  label: string;
  value: string;
  unit?: string;
  trend?: number[];
  color?: string;
  icon?: string;
}

export default function MiniMetric({
  label,
  value,
  unit,
  trend,
  color = "#3b82f6",
  icon,
}: Props) {
  const chartData = trend?.map((v, i) => ({ i, v })) ?? [];

  return (
    <div className="metric-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        {icon && <span className="text-sm">{icon}</span>}
      </div>
      {chartData.length > 1 && (
        <div className="h-10 w-full -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`mini-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#mini-${label})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold tabular-nums text-slate-800">{value}</span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}
