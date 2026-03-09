// ── Oura API v2 response types ──

export interface OuraSleepContributors {
  deep_sleep: number | null;
  efficiency: number | null;
  latency: number | null;
  rem_sleep: number | null;
  restfulness: number | null;
  timing: number | null;
  total_sleep: number | null;
}

export interface DailySleep {
  id: string;
  day: string;
  score: number | null;
  timestamp: string;
  contributors: OuraSleepContributors;
}

export interface ReadinessContributors {
  activity_balance: number | null;
  body_temperature: number | null;
  hrv_balance: number | null;
  previous_day_activity: number | null;
  previous_night: number | null;
  recovery_index: number | null;
  resting_heart_rate: number | null;
  sleep_balance: number | null;
}

export interface DailyReadiness {
  id: string;
  day: string;
  score: number | null;
  timestamp: string;
  temperature_deviation: number | null;
  temperature_trend_deviation: number | null;
  contributors: ReadinessContributors;
}

export interface DailyActivity {
  id: string;
  day: string;
  score: number | null;
  active_calories: number;
  total_calories: number;
  steps: number;
  equivalent_walking_distance: number;
  high_activity_met_minutes: number;
  medium_activity_met_minutes: number;
  low_activity_met_minutes: number;
  sedentary_met_minutes: number;
  timestamp: string;
}

export interface HeartRateEntry {
  bpm: number;
  source: string;
  timestamp: string;
}

export interface PersonalInfo {
  id: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  biological_sex: string | null;
  email: string | null;
}

export interface DailySpO2 {
  id: string;
  day: string;
  spo2_percentage: { average: number } | null;
  breathing_disturbance_index: number | null;
}

export interface DailyStress {
  id: string;
  day: string;
  stress_high: number | null;
  recovery_high: number | null;
  day_summary: string | null;
}

export interface DailyResilience {
  id: string;
  day: string;
  level: string | null;
  contributors: {
    sleep_recovery: number | null;
    daytime_recovery: number | null;
    stress: number | null;
  };
}

export interface DailyCardiovascularAge {
  day: string;
  vascular_age: number | null;
}

export interface VO2Max {
  id: string;
  day: string;
  vo2_max: number | null;
}

// ── App types ──

export type ConditionLevel = "great" | "good" | "fair" | "low";

export interface UserHealth {
  name: string;
  personalInfo: PersonalInfo | null;
  sleep: DailySleep | null;
  readiness: DailyReadiness | null;
  activity: DailyActivity | null;
  heartRate: HeartRateEntry[];
  spo2: DailySpO2 | null;
  stress: DailyStress | null;
  resilience: DailyResilience | null;
  cardiovascularAge: DailyCardiovascularAge | null;
  vo2Max: VO2Max | null;
  sleepTrend: DailySleep[];
  readinessTrend: DailyReadiness[];
  condition: ConditionLevel;
  latestDay: string | null;
  error?: string;
}
