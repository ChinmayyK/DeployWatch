import { Queue } from "bullmq";

import { env } from "../config/env";
import { redisConnection } from "./redis";
import { QueueNames } from "./queue-names";

export interface MonitoringCheckJobPayload {
  apiId: string;
  projectId: string;
  trigger: "dispatcher" | "manual";
}

export interface MonitoringDispatcherJobPayload {
  trigger: "repeat" | "bootstrap";
}

export const monitoringDispatcherQueue = new Queue<MonitoringDispatcherJobPayload>(QueueNames.monitoringDispatcher, {
  connection: redisConnection
});

export const monitoringChecksQueue = new Queue<MonitoringCheckJobPayload>(QueueNames.monitoringChecks, {
  connection: redisConnection
});

export async function ensureMonitoringDispatcherSchedule() {
  await monitoringDispatcherQueue.upsertJobScheduler(
    "monitoring-dispatcher-scheduler",
    {
      every: env.MONITORING_DISPATCHER_INTERVAL_MS
    },
    {
      name: "dispatch-due-checks",
      data: {
        trigger: "repeat"
      }
    }
  );
}

export async function enqueueMonitoringCheck(payload: MonitoringCheckJobPayload) {
  return monitoringChecksQueue.add("run-monitoring-check", payload, {
    removeOnComplete: 250,
    removeOnFail: 250,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5_000
    }
  });
}
