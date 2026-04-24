import { Worker } from "bullmq";

import { logger } from "../config/logger";
import { QueueNames } from "../jobs/queue-names";
import { redisConnection } from "../jobs/redis";
import { monitoringService } from "../modules/monitoring/monitoring.service";

export function createDispatcherWorker() {
  return new Worker(
    QueueNames.monitoringDispatcher,
    async () => {
      const dispatched = await monitoringService.dispatchDueChecks();
      logger.info({ dispatched }, "Monitoring dispatcher cycle completed");
    },
    {
      connection: redisConnection,
      concurrency: 1
    }
  );
}
