import type { UserHealth } from "@/lib/types";
import ScoreRing from "./ScoreRing";
import StatItem from "./StatItem";
import ConditionBadge from "./ConditionBadge";
import TrendChart from "./TrendChart";

interface UserCardProps {
  user: UserHealth;
}

export default function UserCard({ user }: UserCardProps) {
  if (user.error) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
        <h2 className="text-xl font-semibold capitalize mb-2">{user.name}</h2>
        <p className="text-neutral-400 text-sm">{user.error}</p>
      </div>
    );
  }

  const latestHR =
    user.heartRate.length > 0
      ? user.heartRate[user.heartRate.length - 1].bpm
      : null;

  // Compute resting HR as min from today's readings
  const restingHR =
    user.heartRate.length > 0
      ? Math.min(...user.heartRate.map((h) => h.bpm))
      : null;

  const steps = user.activity?.steps ?? 0;
  const calories = user.activity?.active_calories ?? 0;
  const distance = user.activity
    ? (user.activity.equivalent_walking_distance / 1000).toFixed(1)
    : "0";

  const trendData = buildTrend(user);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold capitalize">{user.name}</h2>
          <p className="text-neutral-400 text-sm mt-0.5">Today</p>
        </div>
        <ConditionBadge condition={user.condition} />
      </div>

      {/* Scores */}
      <div className="px-8 py-6 flex justify-center gap-10 border-t border-neutral-100">
        <ScoreRing score={user.sleep?.score ?? null} label="Sleep" />
        <ScoreRing score={user.readiness?.score ?? null} label="Readiness" />
        <ScoreRing score={user.activity?.score ?? null} label="Activity" />
      </div>

      {/* Stats */}
      <div className="px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-neutral-100">
        <StatItem label="Steps" value={steps.toLocaleString()} />
        <StatItem label="Calories" value={calories.toLocaleString()} unit="kcal" />
        <StatItem label="Distance" value={distance} unit="km" />
        <StatItem
          label="Heart Rate"
          value={latestHR ?? "—"}
          unit={latestHR ? "bpm" : undefined}
        />
      </div>

      {/* Resting HR */}
      {restingHR && (
        <div className="px-8 pb-2">
          <span className="text-xs text-neutral-400">
            Resting HR: {restingHR} bpm
          </span>
        </div>
      )}

      {/* Trend */}
      <div className="px-8 py-6 border-t border-neutral-100">
        <h3 className="text-sm font-medium text-neutral-500 mb-3">
          7-Day Trend
        </h3>
        <TrendChart data={trendData} />
      </div>
    </div>
  );
}

function buildTrend(user: UserHealth) {
  const sleepMap = new Map(
    user.sleepTrend.map((s) => [s.day, s.score])
  );
  const readinessMap = new Map(
    user.readinessTrend.map((r) => [r.day, r.score])
  );
  const days = new Set([...sleepMap.keys(), ...readinessMap.keys()]);
  return Array.from(days)
    .sort()
    .map((day) => ({
      day,
      sleep: sleepMap.get(day) ?? null,
      readiness: readinessMap.get(day) ?? null,
    }));
}
