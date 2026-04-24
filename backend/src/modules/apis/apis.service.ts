import type { Prisma } from "@prisma/client";

import { apisRepository } from "./apis.repository";
import type { ApiMutationInput, ApiSummaryDto } from "./apis.types";
import { projectsService } from "../projects/projects.service";
import { calculateApiHealthSnapshot } from "../../shared/health";

function mapApi(api: {
  id: string;
  projectId: string;
  name: string;
  url: string;
  method: Prisma.JsonValue | string;
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
  headers: Prisma.JsonValue | null;
  body: string | null;
  logs: Array<{
    checkedAt: Date;
    responseTimeMs: number;
    statusCode: number | null;
    outcome: "SUCCESS" | "FAILURE" | "TIMEOUT";
  }>;
  incidents: Array<{ id: string }>;
}): ApiSummaryDto {
  const headers = (api.headers ?? {}) as Record<string, string>;
  const health = calculateApiHealthSnapshot(api.logs, api.enabled ? (api.status as never) : "PAUSED", api.incidents.length);

  return {
    id: api.id,
    projectId: api.projectId,
    name: api.name,
    url: api.url,
    method: String(api.method) as ApiSummaryDto["method"],
    enabled: api.enabled,
    monitoringIntervalSeconds: api.monitoringIntervalSeconds,
    timeoutMs: api.timeoutMs,
    latencyThresholdMs: api.latencyThresholdMs,
    failureThreshold: api.failureThreshold,
    status: api.status,
    lastCheckedAt: api.lastCheckedAt,
    lastStatusCode: api.lastStatusCode,
    lastLatencyMs: api.lastLatencyMs,
    consecutiveFailures: api.consecutiveFailures,
    headers,
    body: api.body,
    health
  };
}

export class ApisService {
  async listApis(userId: string, projectId: string) {
    await projectsService.assertProjectOwnership(userId, projectId);
    const apis = await apisRepository.listOwnedApis(userId, projectId);
    return apis.map(mapApi);
  }

  async getApi(userId: string, projectId: string, apiId: string) {
    const api = await apisRepository.findOwnedApi(userId, projectId, apiId);
    if (!api) {
      throw new Error("API not found");
    }

    return mapApi(api);
  }

  async createApi(userId: string, projectId: string, input: ApiMutationInput) {
    await projectsService.assertProjectOwnership(userId, projectId);

    const api = await apisRepository.createApi(projectId, {
      projectId,
      name: input.name,
      url: input.url,
      method: input.method,
      headers: (input.headers ?? {}) as Prisma.InputJsonValue,
      body: input.body,
      monitoringIntervalSeconds: input.monitoringIntervalSeconds,
      timeoutMs: input.timeoutMs ?? 10_000,
      enabled: input.enabled ?? true,
      latencyThresholdMs: input.latencyThresholdMs,
      failureThreshold: input.failureThreshold,
      status: input.enabled === false ? "PAUSED" : "OPERATIONAL",
      nextCheckAt: new Date()
    });

    return mapApi(api);
  }

  async updateApi(userId: string, projectId: string, apiId: string, input: Partial<ApiMutationInput>) {
    const existing = await apisRepository.findOwnedApi(userId, projectId, apiId);
    if (!existing) {
      throw new Error("API not found");
    }

    const enabled = input.enabled ?? existing.enabled;
    const api = await apisRepository.updateApi(apiId, {
      name: input.name,
      url: input.url,
      method: input.method,
      headers: input.headers ? (input.headers as Prisma.InputJsonValue) : undefined,
      body: input.body,
      monitoringIntervalSeconds: input.monitoringIntervalSeconds,
      timeoutMs: input.timeoutMs,
      enabled,
      latencyThresholdMs: input.latencyThresholdMs,
      failureThreshold: input.failureThreshold,
      status: enabled ? undefined : "PAUSED",
      nextCheckAt: enabled ? new Date() : undefined
    });

    return mapApi(api);
  }

  async deleteApi(userId: string, projectId: string, apiId: string) {
    const existing = await apisRepository.findOwnedApi(userId, projectId, apiId);
    if (!existing) {
      throw new Error("API not found");
    }

    await apisRepository.deleteApi(apiId);
  }
}

export const apisService = new ApisService();
