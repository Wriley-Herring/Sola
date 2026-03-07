import { NextResponse } from "next/server";
import { getDatabaseReadiness } from "@/lib/system/database-readiness";

export async function GET() {
  try {
    const readiness = await getDatabaseReadiness();

    return NextResponse.json({
      status: readiness.isReady ? "ok" : "degraded",
      databaseReady: readiness.isReady,
      missingTables: readiness.missingTables,
      missingSeedData: readiness.missingSeedData
    });
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        databaseReady: false,
        missingTables: [],
        missingSeedData: ["database_readiness_check_failed"]
      },
      { status: 503 }
    );
  }
}
