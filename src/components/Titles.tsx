import type { DailySleep, DailyActivity } from "@/lib/types";
import type { SleepDetail } from "@/lib/fetchUserDetail";

interface Props {
  sleepHistory: DailySleep[];
  activityHistory: DailyActivity[];
  sleepDetails: SleepDetail[];
}

interface Title {
  emoji: string;
  name: string;
  reason: string;
}

export default function Titles({
  sleepHistory,
  activityHistory,
  sleepDetails,
}: Props) {
  const titles: Title[] = [];

  // --- 睡眠系 ---
  const recentSleep = sleepHistory.slice(-7);
  const avgSleepScore =
    recentSleep.length > 0
      ? recentSleep.reduce((a, b) => a + (b.score ?? 0), 0) / recentSleep.length
      : 0;

  if (avgSleepScore >= 85) {
    titles.push({ emoji: "😴", name: "安眠の達人", reason: "7日間平均睡眠スコア85+" });
  } else if (avgSleepScore < 50) {
    titles.push({ emoji: "🦉", name: "夜更かしの帝王", reason: "7日間平均睡眠スコア50未満" });
  }

  // 早寝判定（就寝時刻の平均）
  const recentDetails = sleepDetails.slice(-7);
  if (recentDetails.length >= 3) {
    const avgBedtime =
      recentDetails.reduce((sum, s) => {
        const h = new Date(s.bedtime_start).getHours();
        return sum + (h < 12 ? h + 24 : h);
      }, 0) / recentDetails.length;
    if (avgBedtime <= 23) {
      titles.push({ emoji: "🌙", name: "早寝の鬼", reason: "平均就寝23時前" });
    } else if (avgBedtime >= 26) {
      titles.push({ emoji: "🌃", name: "深夜族", reason: "平均就寝2時以降" });
    }
  }

  // 睡眠効率
  const avgEfficiency =
    recentDetails.length > 0
      ? recentDetails.reduce((a, b) => a + b.efficiency, 0) / recentDetails.length
      : 0;
  if (avgEfficiency >= 92) {
    titles.push({ emoji: "💎", name: "睡眠効率マスター", reason: "平均効率92%+" });
  }

  // 深い睡眠
  const avgDeep =
    recentDetails.length > 0
      ? recentDetails.reduce((a, b) => a + b.deep_sleep_duration, 0) / recentDetails.length
      : 0;
  if (avgDeep >= 5400) {
    titles.push({ emoji: "🌊", name: "深海の眠り手", reason: "平均深い睡眠90分+" });
  }

  // --- HRV系 ---
  const hrvValues = recentDetails
    .filter((s) => s.average_hrv != null)
    .map((s) => s.average_hrv!);
  if (hrvValues.length > 0) {
    const avgHrv = hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length;
    if (avgHrv >= 80) {
      titles.push({ emoji: "💓", name: "HRV王", reason: `平均HRV ${Math.round(avgHrv)}ms` });
    }
  }

  // --- 活動系 ---
  const recentActivity = activityHistory.slice(-7);
  const avgSteps =
    recentActivity.length > 0
      ? recentActivity.reduce((a, b) => a + b.steps, 0) / recentActivity.length
      : 0;

  if (avgSteps >= 10000) {
    titles.push({ emoji: "🚶", name: "歩数マシーン", reason: "7日間平均1万歩+" });
  } else if (avgSteps >= 7000) {
    titles.push({ emoji: "👟", name: "ウォーカー", reason: "7日間平均7000歩+" });
  }

  const avgCal =
    recentActivity.length > 0
      ? recentActivity.reduce((a, b) => a + b.active_calories, 0) / recentActivity.length
      : 0;
  if (avgCal >= 500) {
    titles.push({ emoji: "🔥", name: "カロリーバーナー", reason: "平均消費500kcal+" });
  }

  // 最高歩数記録
  const maxSteps = Math.max(...activityHistory.map((a) => a.steps), 0);
  if (maxSteps >= 20000) {
    titles.push({ emoji: "🏆", name: "2万歩の壁突破", reason: `最高${maxSteps.toLocaleString()}歩` });
  }

  // --- 連続系 ---
  let streak = 0;
  let maxStreak = 0;
  for (const s of sleepHistory) {
    if (s.score != null && s.score >= 75) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }
  if (maxStreak >= 7) {
    titles.push({ emoji: "⚡", name: "連勝街道", reason: `${maxStreak}日連続Good Sleep` });
  }

  // --- 規則性 ---
  if (recentDetails.length >= 5) {
    const bedtimes = recentDetails.map((s) => {
      const h = new Date(s.bedtime_start).getHours() + new Date(s.bedtime_start).getMinutes() / 60;
      return h < 18 ? h + 24 : h;
    });
    const avg = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
    const stdDev = Math.sqrt(bedtimes.reduce((sum, h) => sum + (h - avg) ** 2, 0) / bedtimes.length);
    if (stdDev < 0.5) {
      titles.push({ emoji: "🎯", name: "リズムキーパー", reason: "就寝時刻のブレ30分未満" });
    }
  }

  // 称号がない場合
  if (titles.length === 0) {
    titles.push({ emoji: "🌱", name: "ルーキー", reason: "データ蓄積中" });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {titles.map((t) => (
        <div
          key={t.name}
          className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200/60 hover:border-blue-200 hover:from-blue-50 hover:to-indigo-50 transition-all cursor-default"
        >
          <span className="text-sm">{t.emoji}</span>
          <span className="text-xs font-semibold text-slate-700">{t.name}</span>
          {/* ツールチップ */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-slate-800 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {t.reason}
          </div>
        </div>
      ))}
    </div>
  );
}
