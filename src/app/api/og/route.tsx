import { ImageResponse } from "next/og";
import { fetchAllUsers } from "@/lib/fetchAllUsers";
import { computePowerLevel } from "@/lib/condition";

export const revalidate = 300;

export async function GET() {
  const users = await fetchAllUsers();

  const powers = users.map((u) => ({
    name: u.name,
    power: computePowerLevel(u.sleep, u.readiness, u.activity),
    sleep: u.sleep?.score ?? 0,
    readiness: u.readiness?.score ?? 0,
    activity: u.activity?.score ?? 0,
  }));

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "system-ui, sans-serif",
          color: "#fff",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <span style={{ fontSize: "48px" }}>⚔️</span>
          <span
            style={{
              fontSize: "56px",
              fontWeight: 800,
              background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Oura Arena
          </span>
        </div>

        {/* Users */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            alignItems: "center",
          }}
        >
          {powers.map((u, i) => (
            <div
              key={u.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "24px",
                padding: "32px 48px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  textTransform: "capitalize",
                  marginBottom: "16px",
                }}
              >
                {u.name}
              </span>
              <span
                style={{
                  fontSize: "64px",
                  fontWeight: 800,
                  color: "#60a5fa",
                }}
              >
                {u.power}
              </span>
              <span
                style={{
                  fontSize: "18px",
                  color: "#94a3b8",
                  marginTop: "8px",
                }}
              >
                戦闘力
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginTop: "20px",
                  fontSize: "16px",
                  color: "#94a3b8",
                }}
              >
                <span>😴 {u.sleep}</span>
                <span>💚 {u.readiness}</span>
                <span>🔥 {u.activity}</span>
              </div>
            </div>
          ))}

          {powers.length >= 2 && (
            <div
              style={{
                position: "absolute",
                fontSize: "40px",
                fontWeight: 900,
                color: "#f59e0b",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              VS
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "40px",
            fontSize: "18px",
            color: "#64748b",
          }}
        >
          oura-arena.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
