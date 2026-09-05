import { createServer } from "node:http";

import { createApp } from "./app";
import { config } from "./config";
import { connectDatabase, disconnectDatabase } from "./db/prisma";
import { logger } from "./shared/logger/logger";
import { startRequisiteMonitoring, stopRequisiteMonitoring } from "./modules/requisites/requisite-monitor.service";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = createServer(app);

  server.listen(config.server.port, config.server.host, () => {
    logger.info(
      {
        host: config.server.host,
        port: config.server.port,
        nodeEnv: config.nodeEnv,
      },
      "backend server started",
    );
  });
  startRequisiteMonitoring();

  function shutdown(signal: NodeJS.Signals): void {
    logger.info({ signal }, "shutdown signal received");

    const forceExitTimer = setTimeout(() => {
      logger.error("graceful shutdown timed out");
      process.exit(1);
    }, config.server.shutdownTimeoutMs);

    forceExitTimer.unref();

    server.close((error) => {
      void (async () => {
        if (error) {
          logger.error({ err: error }, "http server closed with error");
          process.exitCode = 1;
        }

        await disconnectDatabase();
        stopRequisiteMonitoring();
        clearTimeout(forceExitTimer);
        process.exit();
      })();
    });
  }

  process.on("SIGTERM", () => {
    shutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    shutdown("SIGINT");
  });
}

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "unhandled promise rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "uncaught exception");
  process.exit(1);
});

void bootstrap().catch(async (error: unknown) => {
  logger.fatal({ err: error }, "failed to start backend server");
  await disconnectDatabase();
  process.exit(1);
});


logger.info("BACKEND VERSION: 2026-09-04-01 test");