interface Workout {
  id: string;
  activity: string;
  day: string;
  distance: number | null;
  start_datetime: string;
  end_datetime: string;
  intensity: string;
  calories: number | null;
}

interface Props {
  workouts: Workout[];
}

const activityLabels: Record<string, string> = {
  walking: "ウォーキング",
  running: "ランニング",
  cycling: "サイクリング",
  swimming: "水泳",
  soccer: "サッカー",
  yoga: "ヨガ",
  hiit: "HIIT",
  strength_training: "筋トレ",
  other: "その他",
};

const activityIcons: Record<string, string> = {
  walking: "🚶",
  running: "🏃",
  cycling: "🚴",
  swimming: "🏊",
  soccer: "⚽",
  yoga: "🧘",
  hiit: "💪",
  strength_training: "🏋️",
};

const intensityLabels: Record<string, string> = {
  easy: "軽め",
  moderate: "普通",
  hard: "ハード",
};

const intensityColors: Record<string, string> = {
  easy: "bg-green-50 text-green-600",
  moderate: "bg-blue-50 text-blue-600",
  hard: "bg-red-50 text-red-600",
};

function durationMin(start: string, end: string): number {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );
}

export default function WorkoutList({ workouts }: Props) {
  if (workouts.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs">
        ワークアウト記録なし
      </div>
    );
  }

  const sorted = [...workouts].sort(
    (a, b) => new Date(b.day).getTime() - new Date(a.day).getTime()
  );
  const shown = sorted.slice(0, 20);

  return (
    <div className="space-y-2">
      {shown.map((w) => {
        const dur = durationMin(w.start_datetime, w.end_datetime);
        const dist = w.distance ? (w.distance / 1000).toFixed(1) : null;
        const icon = activityIcons[w.activity] ?? "🏃";
        return (
          <div
            key={w.id}
            className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{icon}</span>
              <div>
                <span className="text-sm font-medium text-slate-700">
                  {activityLabels[w.activity] ?? w.activity}
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {w.day}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="tabular-nums">{dur}分</span>
              {dist && <span className="tabular-nums">{dist}km</span>}
              {w.calories && <span className="tabular-nums">{w.calories}kcal</span>}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  intensityColors[w.intensity] ?? "bg-slate-100 text-slate-500"
                }`}
              >
                {intensityLabels[w.intensity] ?? w.intensity}
              </span>
            </div>
          </div>
        );
      })}
      {workouts.length > 20 && (
        <p className="text-center text-[10px] text-slate-400 pt-2">
          他 {workouts.length - 20} 件
        </p>
      )}
    </div>
  );
}
