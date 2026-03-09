import type { UserHealth } from "./types";
import {
  parseUsersEnv,
  fetchDailySleep,
  fetchDailyReadiness,
  fetchDailyActivity,
  fetchHeartRate,
  fetchPersonalInfo,
  fetchDailySpO2,
  fetchDailyStress,
  fetchDailyResilience,
  fetchDailyCardiovascularAge,
  fetchVO2Max,
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
        spo2: null,
        stress: null,
        resilience: null,
        cardiovascularAge: null,
        vo2Max: null,
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
        // Try recent data first, fall back to historical
        let sleepRecent = await fetchDailySleep(token, daysAgo(7), today);

        if (sleepRecent.length === 0) {
          const probe = await fetchDailySleep(token, daysAgo(365), today);
          if (probe.length > 0) {
            const latestDay = probe[probe.length - 1].day;
            const weekBefore = daysBeforeDate(latestDay, 7);
            sleepRecent = await fetchDailySleep(token, weekBefore, latestDay);
          }
        }

        const latestDay =
          sleepRecent.length > 0
            ? sleepRecent[sleepRecent.length - 1].day
            : today;
        const weekBefore = daysBeforeDate(latestDay, 7);

        const [
          readinessTrend,
          activityTrend,
          heartRate,
          personalInfo,
          spo2Data,
          stressData,
          resilienceData,
          cvAgeData,
          vo2Data,
        ] = await Promise.all([
          fetchDailyReadiness(token, weekBefore, latestDay),
          fetchDailyActivity(token, weekBefore, latestDay),
          fetchHeartRate(token, latestDay),
          fetchPersonalInfo(token),
          fetchDailySpO2(token, daysBeforeDate(latestDay, 1), latestDay).catch(() => []),
          fetchDailyStress(token, daysBeforeDate(latestDay, 1), latestDay).catch(() => []),
          fetchDailyResilience(token, daysBeforeDate(latestDay, 1), latestDay).catch(() => []),
          fetchDailyCardiovascularAge(token, daysBeforeDate(latestDay, 1), latestDay).catch(() => []),
          fetchVO2Max(token, daysBeforeDate(latestDay, 1), latestDay).catch(() => []),
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
          spo2: spo2Data.at(-1) ?? null,
          stress: stressData.at(-1) ?? null,
          resilience: resilienceData.at(-1) ?? null,
          cardiovascularAge: cvAgeData.at(-1) ?? null,
          vo2Max: vo2Data.at(-1) ?? null,
          sleepTrend: sleepRecent,
          readinessTrend,
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
          spo2: null,
          stress: null,
          resilience: null,
          cardiovascularAge: null,
          vo2Max: null,
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
