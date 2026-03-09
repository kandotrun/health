import type {
  DailySleep,
  DailyReadiness,
  DailyActivity,
  HeartRateEntry,
  PersonalInfo,
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
  token: string
): Promise<HeartRateEntry[]> {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return ouraFetch<HeartRateEntry>("heartrate", token, {
    start_datetime: start.toISOString(),
    end_datetime: now.toISOString(),
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
