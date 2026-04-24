import { Queue } from "bullmq";

import { redisConnection } from "./redis";
import { QueueNames } from "./queue-names";

export interface AlertJobPayload {
  alertEventId: string;
}

export const alertsQueue = new Queue<AlertJobPayload>(QueueNames.alerts, {
  connection: redisConnection
});

export async function enqueueAlertDelivery(payload: AlertJobPayload) {
  return alertsQueue.add("deliver-alert", payload, {
    removeOnComplete: 250,
    removeOnFail: 250,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 10_000
    }
  });
}
