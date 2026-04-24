import { Worker } from "bullmq";

import { logger } from "../config/logger";
import { QueueNames } from "../jobs/queue-names";
import { redisConnection } from "../jobs/redis";
import type { AlertJobPayload } from "../jobs/alert.job";
import { alertsService } from "../modules/alerts/alerts.service";

export function createAlertWorker() {
  return new Worker<AlertJobPayload>(
    QueueNames.alerts,
    async (job) => {
      await alertsService.deliverAlert(job.data.alertEventId);
      logger.info({ jobId: job.id, alertEventId: job.data.alertEventId }, "Alert delivery processed");
    },
    {
      connection: redisConnection,
      concurrency: 5
    }
  );
}
