import { NextRequest, NextResponse } from "next/server";

// Reuse the same user/token parsing
function parseUsersEnv(raw?: string): { name: string; token: string }[] {
  if (!raw) return [];
  return raw.split(",").map((pair) => {
    const [name, token] = pair.split(":");
    return { name: name.trim(), token: token.trim() };
  });
}

interface DailySleep {
  day: string;
  score: number | null;
}
interface DailyReadiness {
  day: string;
  score: number | null;
}
interface DailyActivity {
  day: string;
  score: number | null;
  steps: number;
  active_calories: number;
}

async function ouraFetch<T>(
  endpoint: string,
  token: string,
  params: Record<string, string>
): Promise<T[]> {
  const url = new URL(
    `https://api.ouraring.com/v2/usercollection/${endpoint}`
  );
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

function conditionLabel(sleep: number | null, readiness: number | null): { rank: string; label: string; color: string } {
  const avg = Math.round(((sleep ?? 0) + (readiness ?? 0)) / 2);
  if (avg >= 85) return { rank: "S", label: "絶好調", color: "#22c55e" };
  if (avg >= 70) return { rank: "A", label: "好調", color: "#3b82f6" };
  if (avg >= 50) return { rank: "B", label: "普通", color: "#f59e0b" };
  return { rank: "C", label: "要注意", color: "#ef4444" };
}

function powerLevel(sleep: number | null, readiness: number | null, activity: number | null): number {
  return Math.round(((sleep ?? 0) * 0.4 + (readiness ?? 0) * 0.35 + (activity ?? 0) * 0.25));
}

function scoreArc(cx: number, cy: number, r: number, score: number, color: string, label: string): string {
  const pct = Math.min(score / 100, 1);
  const angle = pct * 360;
  const rad = (angle - 90) * (Math.PI / 180);
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);
  const large = angle > 180 ? 1 : 0;

  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="5" />
    <path d="M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x.toFixed(1)} ${y.toFixed(1)}" 
          fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" />
    <text x="${cx}" y="${cy + 2}" text-anchor="middle" dominant-baseline="middle"
          font-size="20" font-weight="700" fill="#334155" font-family="Inter,system-ui,sans-serif">${score}</text>
    <text x="${cx}" y="${cy + r + 18}" text-anchor="middle"
          font-size="12" fill="#94a3b8" font-family="Inter,system-ui,sans-serif">${label}</text>
  `;
}

function sparkline(data: (number | null)[], x: number, y: number, w: number, h: number, color: string): string {
  const valid = data.filter((v): v is number => v != null);
  if (valid.length < 2) return "";
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;
  const step = w / (valid.length - 1);

  const points = valid.map((v, i) => {
    const px = x + i * step;
    const py = y + h - ((v - min) / range) * h;
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  });

  return `<polyline points="${points.join(" ")}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: rawName } = await params;
  const userName = rawName.replace(/\.svg$/, "").toLowerCase();
  const users = parseUsersEnv(process.env.OURA_USERS);
  const userConfig = users.find((u) => u.name.toLowerCase() === userName);

  if (!userConfig) {
    return new NextResponse("User not found", { status: 404 });
  }

  const { token } = userConfig;
  const today = formatDate(new Date());

  // Fetch recent data
  let sleepData = await ouraFetch<DailySleep>("daily_sleep", token, {
    start_date: daysAgo(30),
    end_date: today,
  });

  // If no recent data, look back further
  if (sleepData.length === 0) {
    const probe = await ouraFetch<DailySleep>("daily_sleep", token, {
      start_date: daysAgo(365),
      end_date: today,
    });
    if (probe.length > 0) {
      const latestDay = probe[probe.length - 1].day;
      sleepData = await ouraFetch<DailySleep>("daily_sleep", token, {
        start_date: (() => { const d = new Date(latestDay); d.setDate(d.getDate() - 30); return formatDate(d); })(),
        end_date: latestDay,
      });
    }
  }

  const latestSleepDay = sleepData.at(-1)?.day ?? today;
  const readinessData = await ouraFetch<DailyReadiness>("daily_readiness", token, {
    start_date: (() => { const d = new Date(latestSleepDay); d.setDate(d.getDate() - 30); return formatDate(d); })(),
    end_date: latestSleepDay,
  });
  const activityData = await ouraFetch<DailyActivity>("daily_activity", token, {
    start_date: (() => { const d = new Date(latestSleepDay); d.setDate(d.getDate() - 30); return formatDate(d); })(),
    end_date: latestSleepDay,
  });

  const latestSleep = sleepData.at(-1);
  const latestReadiness = readinessData.at(-1);
  const latestActivity = activityData.at(-1);

  const sleepScore = latestSleep?.score ?? 0;
  const readinessScore = latestReadiness?.score ?? 0;
  const activityScore = latestActivity?.score ?? 0;
  const steps = latestActivity?.steps ?? 0;
  const calories = latestActivity?.active_calories ?? 0;

  const condition = conditionLabel(sleepScore, readinessScore);
  const power = powerLevel(sleepScore, readinessScore, activityScore);

  // Sparkline data (last 14 days)
  const sleepSparkData = sleepData.slice(-14).map((s) => s.score);
  const readinessSparkData = readinessData.slice(-14).map((r) => r.score);

  const cardWidth = 600;
  const cardHeight = 280;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}">
  <defs>
    <clipPath id="roundedCard">
      <rect width="${cardWidth}" height="${cardHeight}" rx="16" />
    </clipPath>
  </defs>

  <g clip-path="url(#roundedCard)">
    <!-- Background -->
    <rect width="${cardWidth}" height="${cardHeight}" fill="#ffffff" />

    <!-- Border -->
    <rect width="${cardWidth}" height="${cardHeight}" rx="16" fill="none" stroke="#e2e8f0" stroke-width="1" />

    <!-- Header -->
    <text x="28" y="36" font-size="20" font-weight="700" fill="#1e293b" font-family="Inter,system-ui,sans-serif">
      ${userConfig.name}
    </text>
    <text x="28" y="54" font-size="12" fill="#94a3b8" font-family="Inter,system-ui,sans-serif">
      ${latestSleepDay} · Oura Arena
    </text>

    <!-- Rank badge -->
    <rect x="${cardWidth - 90}" y="16" width="68" height="38" rx="10" fill="${condition.color}" opacity="0.1" />
    <text x="${cardWidth - 56}" y="36" text-anchor="middle" font-size="18" font-weight="800" fill="${condition.color}" font-family="Inter,system-ui,sans-serif">
      ${condition.rank}
    </text>
    <text x="${cardWidth - 56}" y="49" text-anchor="middle" font-size="10" fill="${condition.color}" font-family="Inter,system-ui,sans-serif">
      ${condition.label}
    </text>

    <!-- Score rings -->
    ${scoreArc(90, 130, 38, sleepScore, "#6366f1", "睡眠")}
    ${scoreArc(200, 130, 38, readinessScore, "#22c55e", "回復")}
    ${scoreArc(310, 130, 38, activityScore, "#f59e0b", "活動")}

    <!-- Power bar -->
    <text x="400" y="100" font-size="12" fill="#94a3b8" font-family="Inter,system-ui,sans-serif">戦闘力</text>
    <text x="${cardWidth - 24}" y="100" text-anchor="end" font-size="16" font-weight="700" fill="#334155" font-family="Inter,system-ui,sans-serif">${power}</text>
    <rect x="400" y="108" width="172" height="8" rx="4" fill="#e2e8f0" />
    <rect x="400" y="108" width="${Math.round(172 * power / 100)}" height="8" rx="4" fill="${condition.color}" />

    <!-- Steps & Calories -->
    <text x="400" y="140" font-size="12" fill="#64748b" font-family="Inter,system-ui,sans-serif">🚶 ${steps.toLocaleString()} 歩</text>
    <text x="400" y="160" font-size="12" fill="#64748b" font-family="Inter,system-ui,sans-serif">🔥 ${calories} kcal</text>

    <!-- Sparklines -->
    <text x="28" y="215" font-size="11" fill="#94a3b8" font-family="Inter,system-ui,sans-serif">睡眠 14日間</text>
    ${sparkline(sleepSparkData, 28, 222, 240, 30, "#6366f1")}

    <text x="310" y="215" font-size="11" fill="#94a3b8" font-family="Inter,system-ui,sans-serif">回復 14日間</text>
    ${sparkline(readinessSparkData, 310, 222, 240, 30, "#22c55e")}
  </g>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
