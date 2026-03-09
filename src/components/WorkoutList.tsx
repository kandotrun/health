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
  dancing: "ダンス",
  pilates: "ピラティス",
  hiking: "ハイキング",
  other: "その他",
};

const intensityLabels: Record<string, string> = {
  easy: "軽め",
  moderate: "普通",
  hard: "ハード",
};

function durationMin(start: string, end: string): number {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );
}

export default function WorkoutList({ workouts }: Props) {
  if (workouts.length === 0) {
    return (
      <div className="py-6 text-center text-neutral-400 text-xs">
        ワークアウト記録なし
      </div>
    );
  }

  // Show latest 20
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.day).getTime() - new Date(a.day).getTime()
  );
  const shown = sorted.slice(0, 20);

  return (
    <div className="space-y-2">
      {shown.map((w) => {
        const dur = durationMin(w.start_datetime, w.end_datetime);
        const dist = w.distance ? (w.distance / 1000).toFixed(1) : null;
        return (
          <div
            key={w.id}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/40 border border-black/[0.03]"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {activityLabels[w.activity] ?? w.activity}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {w.day}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span>{dur}分</span>
              {dist && <span>{dist}km</span>}
              {w.calories && <span>{w.calories}kcal</span>}
              <span className="px-1.5 py-0.5 rounded bg-black/[0.04] text-[10px]">
                {intensityLabels[w.intensity] ?? w.intensity}
              </span>
            </div>
          </div>
        );
      })}
      {workouts.length > 20 && (
        <p className="text-center text-[10px] text-neutral-400 pt-1">
          他 {workouts.length - 20} 件
        </p>
      )}
    </div>
  );
}
