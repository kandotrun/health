import type { ConditionLevel, DailySleep, DailyReadiness } from "./types";

export function computeCondition(
  sleep: DailySleep | null,
  readiness: DailyReadiness | null
): ConditionLevel {
  const scores: number[] = [];
  if (sleep?.score != null) scores.push(sleep.score);
  if (readiness?.score != null) scores.push(readiness.score);

  if (scores.length === 0) return "fair";

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  if (avg >= 85) return "great";
  if (avg >= 70) return "good";
  if (avg >= 50) return "fair";
  return "low";
}

export const conditionConfig: Record<
  ConditionLevel,
  { label: string; emoji: string; color: string; bg: string }
> = {
  great: {
    label: "Feeling Great",
    emoji: "✦",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  good: {
    label: "Looking Good",
    emoji: "○",
    color: "text-lime-600",
    bg: "bg-lime-50",
  },
  fair: {
    label: "Take It Easy",
    emoji: "~",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  low: {
    label: "Rest Up",
    emoji: "↓",
    color: "text-red-500",
    bg: "bg-red-50",
  },
};
