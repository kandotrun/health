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
        error: "No users configured. Set OURA_USERS in your environment.",
      },
    ];
  }

  const today = formatDate(new Date());
  const weekAgo = daysAgo(7);

  return Promise.all(
    users.map(async ({ name, token }): Promise<UserHealth> => {
      try {
        const [
          sleepToday,
          readinessToday,
          activityToday,
          heartRate,
          personalInfo,
          sleepTrend,
          readinessTrend,
        ] = await Promise.all([
          fetchDailySleep(token, daysAgo(1), today),
          fetchDailyReadiness(token, daysAgo(1), today),
          fetchDailyActivity(token, daysAgo(1), today),
          fetchHeartRate(token),
          fetchPersonalInfo(token),
          fetchDailySleep(token, weekAgo, today),
          fetchDailyReadiness(token, weekAgo, today),
        ]);

        const sleep = sleepToday.at(-1) ?? null;
        const readiness = readinessToday.at(-1) ?? null;
        const activity = activityToday.at(-1) ?? null;
        const condition = computeCondition(sleep, readiness);

        return {
          name,
          personalInfo,
          sleep,
          readiness,
          activity,
          heartRate,
          sleepTrend,
          readinessTrend,
          condition,
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
          error:
            err instanceof Error
              ? err.message
              : "Failed to fetch data from Oura API",
        };
      }
    })
  );
}
