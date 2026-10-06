import { PrismaClient } from "@prisma/client";


const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === "production"
    ? ["error", "warn"]
    : ["query", "error", "warn"],
});

export const prisma = prismaClient;

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  console.info("database connection established");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.info("database connection closed");
}
