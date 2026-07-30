import { PrismaClient } from "@prisma/client";

import { config } from "../config";
import { logger } from "../shared/logger/logger";

const prismaClient = new PrismaClient({
  log: config.isProduction
    ? ["error", "warn"]
    : ["query", "error", "warn"],
});

export const prisma = prismaClient;

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("database connection established");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("database connection closed");
}
