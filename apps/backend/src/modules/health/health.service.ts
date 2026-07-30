import { prisma } from "../../db/prisma";
import type { HealthResponse } from "./health.types";

export async function getHealth(): Promise<HealthResponse> {
  let database: HealthResponse["dependencies"]["database"] = "up";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "down";
  }

  return {
    status: database === "up" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    dependencies: {
      database,
    },
  };
}
