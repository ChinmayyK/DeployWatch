import { createServer } from "node:http";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./db/prisma";
import { ensureMonitoringDispatcherSchedule } from "./jobs/monitoring.job";
import { redisConnection } from "./jobs/redis";
import { createApp } from "./shared/app";

async function bootstrap() {
  await prisma.$connect();
  await redisConnection.ping();
  await ensureMonitoringDispatcherSchedule();

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "DeployWatch API server started");
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down DeployWatch API");
    server.close(async () => {
      await prisma.$disconnect();
      await redisConnection.quit();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

void bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to bootstrap API server");
  process.exit(1);
});
