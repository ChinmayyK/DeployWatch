import { logger } from "../config/logger";
import { ensureMonitoringDispatcherSchedule } from "../jobs/monitoring.job";
import { prisma } from "../db/prisma";
import { createAlertWorker } from "./alert.worker";
import { createDispatcherWorker } from "./dispatcher.worker";
import { createMonitoringWorker } from "./monitoring.worker";

async function startWorkers() {
  await prisma.$connect();
  await ensureMonitoringDispatcherSchedule();

  const workers = [createDispatcherWorker(), createMonitoringWorker(), createAlertWorker()];

  workers.forEach((worker) => {
    worker.on("failed", (job, error) => {
      logger.error({ err: error, jobId: job?.id, queue: worker.name }, "Worker job failed");
    });
  });

  logger.info("DeployWatch workers started");
}

void startWorkers().catch((error) => {
  logger.error({ err: error }, "Failed to start workers");
  process.exit(1);
});
