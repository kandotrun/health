import { computeTitles } from "@/lib/titles";
import type { DailySleep, DailyActivity } from "@/lib/types";
import type { SleepDetail } from "@/lib/fetchUserDetail";

interface Props {
  sleepHistory: DailySleep[];
  activityHistory: DailyActivity[];
  sleepDetails: SleepDetail[];
}

export default function Titles({
  sleepHistory,
  activityHistory,
  sleepDetails,
}: Props) {
  const titles = computeTitles(
    sleepHistory,
    activityHistory as any,
    sleepDetails as any
  );

  return (
    <div className="flex flex-wrap gap-1">
      {titles.map((t) => (
        <span
          key={t.name}
          className="group relative inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100/80 border border-slate-200/50 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-default text-[10px] leading-tight"
        >
          <span>{t.emoji}</span>
          <span className="font-medium text-slate-600">{t.name}</span>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded bg-slate-800 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {t.reason}
          </span>
        </span>
      ))}
    </div>
  );
}
