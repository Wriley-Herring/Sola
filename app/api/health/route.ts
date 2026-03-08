import { NextResponse } from "next/server";
import { getDatabaseReadiness } from "@/lib/system/database-readiness";

export async function GET() {
  try {
    const readiness = await getDatabaseReadiness();

    if (readiness.isReady) {
      return NextResponse.json({
        status: "ok",
        checks: {
          app: "up",
          database: "up"
        }
      });
    }

    return NextResponse.json(
      {
        status: "degraded",
        checks: {
          app: "up",
          database: "down"
        },
        reason: readiness.reason ?? "Database is unavailable."
      },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        checks: {
          app: "up",
          database: "down"
        },
        reason: "Database readiness check failed."
      },
      { status: 503 }
    );
  }
}
