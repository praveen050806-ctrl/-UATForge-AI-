import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "UATForge AI",
    version: "0.1.0-milestone-1b",
    timestamp: new Date().toISOString(),
    shellMode: true,
    services: {
      geminiAi: "deferred",
      mongoDb: "deferred",
      validationEngine: "initialized",
    },
  });
}
