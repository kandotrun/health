import { NextRequest, NextResponse } from "next/server";
import {
  parseExternalUsersEnv,
  saveHealthData,
  type ExternalHealthData,
} from "@/lib/externalData";

interface DailyEntry {
  day: string;
  sleep?: ExternalHealthData["sleep"];
  activity?: ExternalHealthData["activity"];
  heart_rate?: ExternalHealthData["heart_rate"];
  spo2?: number | null;
  weight_kg?: number | null;
  respiratory_rate?: number | null;
}

interface SubmitBody {
  day?: string;
  timestamp?: string;
  device?: string;
  daily?: DailyEntry[];
  days_count?: number;
  sync_from?: string;
  height_cm?: number;
  workouts?: unknown[];
  // 従来の単日フォーマット
  sleep?: ExternalHealthData["sleep"];
  activity?: ExternalHealthData["activity"];
  heart_rate?: ExternalHealthData["heart_rate"];
  spo2?: number | null;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!apiKey) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const externalUsers = parseExternalUsersEnv(process.env.EXTERNAL_USERS);
  const user = externalUsers.find((u) => u.apiKey === apiKey);

  if (!user) {
    return NextResponse.json({ error: "無効なAPIキー" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as SubmitBody;

    if (!body.timestamp) {
      return NextResponse.json(
        { error: "timestamp は必須です" },
        { status: 400 }
      );
    }

    // === 全期間データ（daily配列） ===
    if (body.daily && Array.isArray(body.daily) && body.daily.length > 0) {
      let saved = 0;
      let errors = 0;

      for (const entry of body.daily) {
        if (!entry.day) continue;
        try {
          const data: ExternalHealthData = {
            name: user.name,
            device: body.device ?? "unknown",
            timestamp: body.timestamp,
            day: entry.day,
            sleep: entry.sleep,
            activity: entry.activity,
            heart_rate: entry.heart_rate,
            spo2: entry.spo2,
          };
          await saveHealthData(data);
          saved++;
        } catch {
          errors++;
        }
      }

      // 最新データも更新（daily配列の最後の日）
      const latestEntry = body.daily
        .filter((e) => e.day)
        .sort((a, b) => a.day.localeCompare(b.day))
        .at(-1);

      if (latestEntry) {
        const latestData: ExternalHealthData = {
          name: user.name,
          device: body.device ?? "unknown",
          timestamp: body.timestamp,
          day: latestEntry.day,
          sleep: latestEntry.sleep,
          activity: latestEntry.activity,
          heart_rate: latestEntry.heart_rate,
          spo2: latestEntry.spo2,
        };
        await saveHealthData(latestData);
      }

      return NextResponse.json({
        ok: true,
        message: `${user.name} の${saved}日分のデータを保存しました`,
        saved,
        errors,
        sync_from: body.sync_from,
      });
    }

    // === 従来の単日フォーマット ===
    if (!body.day) {
      return NextResponse.json(
        { error: "day は必須です（または daily 配列を送信してください）" },
        { status: 400 }
      );
    }

    const data: ExternalHealthData = {
      name: user.name,
      device: body.device ?? "unknown",
      timestamp: body.timestamp,
      day: body.day,
      sleep: body.sleep,
      activity: body.activity,
      heart_rate: body.heart_rate,
      spo2: body.spo2,
    };

    await saveHealthData(data);

    return NextResponse.json({
      ok: true,
      message: `${user.name} のデータを保存しました`,
      day: data.day,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "データの処理に失敗しました", detail: String(e) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Oura Arena Submit API",
    usage: "POST /api/submit with Bearer token",
    formats: ["single day (day + timestamp)", "bulk (daily[] + timestamp)"],
  });
}
