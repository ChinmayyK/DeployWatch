import type { HttpMethod } from "@prisma/client";

export interface ApiMutationInput {
  name: string;
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  monitoringIntervalSeconds: number;
  timeoutMs?: number;
  enabled?: boolean;
  latencyThresholdMs?: number;
  failureThreshold?: number;
}

export interface ApiSummaryDto {
  id: string;
  projectId: string;
  name: string;
  url: string;
  method: HttpMethod;
  enabled: boolean;
  monitoringIntervalSeconds: number;
  timeoutMs: number;
  latencyThresholdMs: number | null;
  failureThreshold: number | null;
  status: string;
  lastCheckedAt: Date | null;
  lastStatusCode: number | null;
  lastLatencyMs: number | null;
  consecutiveFailures: number;
  headers: Record<string, string>;
  body: string | null;
  health: {
    status: string;
    uptimePercentage: number;
    averageLatencyMs: number | null;
    latestLatencyMs: number | null;
    lastCheckedAt: Date | null;
    lastStatusCode: number | null;
    activeIncidents: number;
  };
}
