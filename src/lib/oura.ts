import type {
  DailySleep,
  DailyReadiness,
  DailyActivity,
  HeartRateEntry,
  PersonalInfo,
  DailySpO2,
  DailyStress,
  DailyResilience,
  DailyCardiovascularAge,
  VO2Max,
} from "./types";

const BASE = "https://api.ouraring.com/v2/usercollection";

async function ouraFetch<T>(
  endpoint: string,
  token: string,
  params?: Record<string, string>
): Promise<T[]> {
  const url = new URL(`${BASE}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 }, // 5 min ISR
  });
  if (!res.ok) {
    throw new Error(`Oura API ${endpoint}: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json.data ?? [];
}

async function ouraFetchSingle<T>(
  endpoint: string,
  token: string
): Promise<T | null> {
  const res = await fetch(`https://api.ouraring.com/v2/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

export async function fetchDailySleep(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<DailySleep[]> {
  return ouraFetch<DailySleep>("daily_sleep", token, {
    start_date: startDate ?? daysAgo(1),
    end_date: endDate ?? formatDate(new Date()),
  });
}

export async function fetchDailyReadiness(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<DailyReadiness[]> {
  return ouraFetch<DailyReadiness>("daily_readiness", token, {
    start_date: startDate ?? daysAgo(1),
    end_date: endDate ?? formatDate(new Date()),
  });
}

export async function fetchDailyActivity(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<DailyActivity[]> {
  return ouraFetch<DailyActivity>("daily_activity", token, {
    start_date: startDate ?? daysAgo(1),
    end_date: endDate ?? formatDate(new Date()),
  });
}

export async function fetchHeartRate(
  token: string,
  day?: string
): Promise<HeartRateEntry[]> {
  const baseDate = day ? new Date(day + "T00:00:00Z") : new Date();
  const start = new Date(baseDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(baseDate);
  end.setUTCHours(23, 59, 59, 999);
  return ouraFetch<HeartRateEntry>("heartrate", token, {
    start_datetime: start.toISOString(),
    end_datetime: end.toISOString(),
  });
}

export async function fetchDailySpO2(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<DailySpO2[]> {
  return ouraFetch<DailySpO2>("daily_spo2", token, {
    start_date: startDate ?? daysAgo(1),
    end_date: endDate ?? formatDate(new Date()),
  });
}

export async function fetchDailyStress(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<DailyStress[]> {
  return ouraFetch<DailyStress>("daily_stress", token, {
    start_date: startDate ?? daysAgo(1),
    end_date: endDate ?? formatDate(new Date()),
  });
}

export async function fetchDailyResilience(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<DailyResilience[]> {
  return ouraFetch<DailyResilience>("daily_resilience", token, {
    start_date: startDate ?? daysAgo(1),
    end_date: endDate ?? formatDate(new Date()),
  });
}

export async function fetchDailyCardiovascularAge(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<DailyCardiovascularAge[]> {
  return ouraFetch<DailyCardiovascularAge>("daily_cardiovascular_age", token, {
    start_date: startDate ?? daysAgo(1),
    end_date: endDate ?? formatDate(new Date()),
  });
}

export async function fetchVO2Max(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<VO2Max[]> {
  return ouraFetch<VO2Max>("vo2_max", token, {
    start_date: startDate ?? daysAgo(1),
    end_date: endDate ?? formatDate(new Date()),
  });
}

export async function fetchPersonalInfo(
  token: string
): Promise<PersonalInfo | null> {
  return ouraFetchSingle<PersonalInfo>("personal_info", token);
}

export interface OuraUserConfig {
  name: string;
  token: string;
}

export function parseUsersEnv(env?: string): OuraUserConfig[] {
  if (!env) return [];
  return env
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const colonIdx = entry.indexOf(":");
      if (colonIdx === -1) return null;
      return {
        name: entry.slice(0, colonIdx).trim(),
        token: entry.slice(colonIdx + 1).trim(),
      };
    })
    .filter((u): u is OuraUserConfig => u !== null && u.token.length > 0);
}
