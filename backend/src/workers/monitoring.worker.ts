import { Worker } from "bullmq";

import { logger } from "../config/logger";
import { QueueNames } from "../jobs/queue-names";
import { redisConnection } from "../jobs/redis";
import type { MonitoringCheckJobPayload } from "../jobs/monitoring.job";
import { monitoringService } from "../modules/monitoring/monitoring.service";

export function createMonitoringWorker() {
  return new Worker<MonitoringCheckJobPayload>(
    QueueNames.monitoringChecks,
    async (job) => {
      await monitoringService.runCheck(job.data);
      logger.info({ jobId: job.id, apiId: job.data.apiId }, "Monitoring check processed");
    },
    {
      connection: redisConnection,
      concurrency: 10
    }
  );
}
