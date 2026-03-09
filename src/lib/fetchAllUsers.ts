import type { UserHealth } from "./types";
import {
  parseUsersEnv,
  fetchDailySleep,
  fetchDailyReadiness,
  fetchDailyActivity,
  fetchHeartRate,
  fetchPersonalInfo,
} from "./oura";
import { computeCondition } from "./condition";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBeforeDate(base: string, n: number): string {
  const d = new Date(base + "T00:00:00Z");
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

export async function fetchAllUsers(): Promise<UserHealth[]> {
  const users = parseUsersEnv(process.env.OURA_USERS);

  if (users.length === 0) {
    return [
      {
        name: "demo",
        personalInfo: null,
        sleep: null,
        readiness: null,
        activity: null,
        heartRate: [],
        sleepTrend: [],
        readinessTrend: [],
        condition: "fair",
        latestDay: null,
        error: "No users configured. Set OURA_USERS in your environment.",
      },
    ];
  }

  const today = formatDate(new Date());

  return Promise.all(
    users.map(async ({ name, token }): Promise<UserHealth> => {
      try {
        // First, try to get recent data (last 7 days)
        let sleepRecent = await fetchDailySleep(token, daysAgo(7), today);

        // If no recent data, look back further to find the latest available data
        if (sleepRecent.length === 0) {
          const probe = await fetchDailySleep(token, daysAgo(365), today);
          if (probe.length > 0) {
            const latestDay = probe[probe.length - 1].day;
            const weekBefore = daysBeforeDate(latestDay, 7);
            sleepRecent = await fetchDailySleep(token, weekBefore, latestDay);
          }
        }

        // Determine the "latest day" for fetching other data
        const latestDay =
          sleepRecent.length > 0
            ? sleepRecent[sleepRecent.length - 1].day
            : today;
        const weekBefore = daysBeforeDate(latestDay, 7);

        const [readinessTrend, activityTrend, heartRate, personalInfo] =
          await Promise.all([
            fetchDailyReadiness(token, weekBefore, latestDay),
            fetchDailyActivity(token, weekBefore, latestDay),
            fetchHeartRate(token, latestDay),
            fetchPersonalInfo(token),
          ]);

        const sleep = sleepRecent.at(-1) ?? null;
        const readiness = readinessTrend.at(-1) ?? null;
        const activity = activityTrend.at(-1) ?? null;
        const condition = computeCondition(sleep, readiness);

        return {
          name,
          personalInfo,
          sleep,
          readiness,
          activity,
          heartRate,
          sleepTrend: sleepRecent,
          readinessTrend: readinessTrend,
          condition,
          latestDay,
        };
      } catch (err) {
        return {
          name,
          personalInfo: null,
          sleep: null,
          readiness: null,
          activity: null,
          heartRate: [],
          sleepTrend: [],
          readinessTrend: [],
          condition: "fair",
          latestDay: null,
          error:
            err instanceof Error
              ? err.message
              : "Failed to fetch data from Oura API",
        };
      }
    })
  );
}
