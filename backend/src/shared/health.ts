import type { MonitoringState, RequestOutcome } from "@prisma/client";

interface LogLike {
  checkedAt: Date;
  responseTimeMs: number;
  statusCode: number | null;
  outcome: RequestOutcome;
}

export interface ApiHealthSnapshot {
  status: MonitoringState;
  uptimePercentage: number;
  averageLatencyMs: number | null;
  latestLatencyMs: number | null;
  lastCheckedAt: Date | null;
  lastStatusCode: number | null;
  activeIncidents: number;
}

export function calculateApiHealthSnapshot(
  logs: LogLike[],
  status: MonitoringState,
  activeIncidents: number
): ApiHealthSnapshot {
  const latest = logs[0];
  const successfulLogs = logs.filter((log) => log.outcome === "SUCCESS");
  const uptimePercentage = logs.length > 0 ? (successfulLogs.length / logs.length) * 100 : 0;
  const averageLatencyMs =
    successfulLogs.length > 0
      ? Math.round(
          successfulLogs.reduce((sum, log) => sum + log.responseTimeMs, 0) / successfulLogs.length
        )
      : null;

  return {
    status,
    uptimePercentage,
    averageLatencyMs,
    latestLatencyMs: latest?.responseTimeMs ?? null,
    lastCheckedAt: latest?.checkedAt ?? null,
    lastStatusCode: latest?.statusCode ?? null,
    activeIncidents
  };
}
