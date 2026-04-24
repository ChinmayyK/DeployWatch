import { IncidentKind, IncidentStatus, type IncidentSeverity, type MonitoringState, type RequestOutcome } from "@prisma/client";

import { env } from "../../config/env";
import { alertsService } from "../alerts/alerts.service";
import { incidentsRepository } from "../incidents/incidents.repository";
import { enqueueMonitoringCheck, type MonitoringCheckJobPayload } from "../../jobs/monitoring.job";
import { AppError } from "../../utils/http-error";
import { monitoringRepository } from "./monitoring.repository";
import type { MonitoringCheckExecutionResult } from "./monitoring.types";

export class MonitoringService {
  async dispatchDueChecks() {
    const dueApis = await monitoringRepository.claimDueApis(env.MONITORING_BATCH_LIMIT);

    await Promise.all(
      dueApis.map((api) =>
        enqueueMonitoringCheck({
          apiId: api.id,
          projectId: api.projectId,
          trigger: "dispatcher"
        })
      )
    );

    return dueApis.length;
  }

  async queueManualRun(userId: string, projectId: string, apiId: string) {
    const api = await monitoringRepository.getOwnedApiForExecution(userId, projectId, apiId);
    if (!api) {
      throw new AppError(404, "API_NOT_FOUND", "API was not found");
    }

    await enqueueMonitoringCheck({
      apiId: api.id,
      projectId: api.projectId,
      trigger: "manual"
    });
  }

  async runCheck(payload: MonitoringCheckJobPayload) {
    const api = await monitoringRepository.getApiForExecution(payload.apiId);
    if (!api || !api.enabled) {
      return;
    }

    const result = await this.executeRequest({
      url: api.url,
      method: api.method,
      headers: (api.headers ?? {}) as Record<string, string>,
      body: api.body,
      timeoutMs: api.timeoutMs
    });

    const policy = api.project.alertPolicy;
    const latencyThreshold = api.latencyThresholdMs ?? policy?.latencyThresholdMs ?? 800;
    const failureThreshold = api.failureThreshold ?? policy?.consecutiveFailureThreshold ?? 3;
    const consecutiveFailures = result.success ? 0 : api.consecutiveFailures + 1;
    const latencyBreached = result.success && result.latencyMs > latencyThreshold;
    const status = this.determineStatus(result.success, latencyBreached, consecutiveFailures, failureThreshold);
    const checkedAt = new Date();
    const outcome: RequestOutcome = result.success ? "SUCCESS" : result.timedOut ? "TIMEOUT" : "FAILURE";

    await monitoringRepository.createCheckLog({
      projectId: api.projectId,
      apiId: api.id,
      responseTimeMs: result.latencyMs,
      statusCode: result.statusCode,
      outcome,
      errorMessage: result.errorMessage,
      responseHeaders: undefined,
      requestSnapshot: {
        url: api.url,
        method: api.method,
        headers: api.headers ?? {},
        body: api.body ?? null
      }
    });

    await monitoringRepository.updateApiAfterCheck({
      apiId: api.id,
      status,
      consecutiveFailures,
      lastCheckedAt: checkedAt,
      lastStatusCode: result.statusCode,
      lastLatencyMs: result.latencyMs,
      lastError: result.errorMessage
    });

    await this.handleIncidents({
      projectId: api.projectId,
      apiId: api.id,
      apiName: api.name,
      failureThreshold,
      latencyThreshold,
      consecutiveFailures,
      result,
      latencyBreached,
      checkedAt
    });
  }

  async getHealthSummary() {
    const [dueChecks, enabledApis] = await Promise.all([
      monitoringRepository.countDueApis(),
      monitoringRepository.countEnabledApis()
    ]);

    return {
      enabledApis,
      dueChecks,
      dispatcherIntervalMs: env.MONITORING_DISPATCHER_INTERVAL_MS
    };
  }

  private determineStatus(
    success: boolean,
    latencyBreached: boolean,
    consecutiveFailures: number,
    failureThreshold: number
  ): MonitoringState {
    if (!success && consecutiveFailures >= failureThreshold) {
      return "DOWN";
    }

    if (!success || latencyBreached) {
      return "DEGRADED";
    }

    return "OPERATIONAL";
  }

  private async executeRequest(input: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string | null;
    timeoutMs: number;
  }): Promise<MonitoringCheckExecutionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutMs || env.HTTP_REQUEST_TIMEOUT_MS);
    const started = performance.now();

    try {
      const response = await fetch(input.url, {
        method: input.method,
        headers: input.headers,
        body: input.method === "GET" ? undefined : input.body ?? undefined,
        signal: controller.signal
      });

      const latencyMs = Math.round(performance.now() - started);
      clearTimeout(timeout);

      return {
        success: response.ok,
        statusCode: response.status,
        latencyMs,
        errorMessage: response.ok ? null : `HTTP ${response.status}`,
        timedOut: false
      };
    } catch (error) {
      clearTimeout(timeout);
      const latencyMs = Math.round(performance.now() - started);
      const timedOut = error instanceof Error && error.name === "AbortError";

      return {
        success: false,
        statusCode: null,
        latencyMs,
        errorMessage: timedOut ? "Request timed out" : error instanceof Error ? error.message : "Request failed",
        timedOut
      };
    }
  }

  private async handleIncidents(input: {
    projectId: string;
    apiId: string;
    apiName: string;
    failureThreshold: number;
    latencyThreshold: number;
    consecutiveFailures: number;
    result: MonitoringCheckExecutionResult;
    latencyBreached: boolean;
    checkedAt: Date;
  }) {
    await Promise.all([
      this.handleFailureIncident(input),
      this.handleLatencyIncident(input)
    ]);
  }

  private async handleFailureIncident(input: {
    projectId: string;
    apiId: string;
    apiName: string;
    failureThreshold: number;
    consecutiveFailures: number;
    result: MonitoringCheckExecutionResult;
  }) {
    const openIncident = await incidentsRepository.findOpenIncident(input.apiId, IncidentKind.FAILURE);
    const thresholdReached = !input.result.success && input.consecutiveFailures >= input.failureThreshold;

    if (thresholdReached && !openIncident) {
      const severity: IncidentSeverity =
        input.consecutiveFailures >= input.failureThreshold + 2 ? "CRITICAL" : "MAJOR";
      const incident = await incidentsRepository.createIncident({
        projectId: input.projectId,
        apiId: input.apiId,
        kind: IncidentKind.FAILURE,
        severity,
        title: `${input.apiName} is failing consecutive health checks`,
        summary: `${input.apiName} has breached the consecutive failure threshold.`,
        message: `Detected ${input.consecutiveFailures} consecutive failures. Latest error: ${input.result.errorMessage ?? "Unknown error"}.`
      });

      await alertsService.queueIncidentOpenedAlert({
        projectId: input.projectId,
        apiId: input.apiId,
        incidentId: incident.id,
        subject: `[DeployWatch] Failure incident opened for ${input.apiName}`,
        body: `${input.apiName} has reached ${input.consecutiveFailures} consecutive failures.`
      });
      return;
    }

    if (thresholdReached && openIncident) {
      await incidentsRepository.updateIncidentStatus({
        incidentId: openIncident.id,
        status: IncidentStatus.MONITORING,
        message: `Failure condition persists. Consecutive failures: ${input.consecutiveFailures}.`
      });
      return;
    }

    if (input.result.success && openIncident) {
      await incidentsRepository.updateIncidentStatus({
        incidentId: openIncident.id,
        status: IncidentStatus.RESOLVED,
        resolvedAt: new Date(),
        message: `${input.apiName} recovered and health checks are succeeding again.`
      });

      await alertsService.queueIncidentResolvedAlert({
        projectId: input.projectId,
        apiId: input.apiId,
        incidentId: openIncident.id,
        subject: `[DeployWatch] Failure incident resolved for ${input.apiName}`,
        body: `${input.apiName} recovered and the failure incident has been resolved.`
      });
    }
  }

  private async handleLatencyIncident(input: {
    projectId: string;
    apiId: string;
    apiName: string;
    latencyThreshold: number;
    result: MonitoringCheckExecutionResult;
    latencyBreached: boolean;
  }) {
    const openIncident = await incidentsRepository.findOpenIncident(input.apiId, IncidentKind.LATENCY);

    if (input.latencyBreached && !openIncident) {
      const severity: IncidentSeverity =
        input.result.latencyMs >= input.latencyThreshold * 1.5 ? "MAJOR" : "MINOR";
      const incident = await incidentsRepository.createIncident({
        projectId: input.projectId,
        apiId: input.apiId,
        kind: IncidentKind.LATENCY,
        severity,
        title: `${input.apiName} exceeded the latency threshold`,
        summary: `${input.apiName} is responding slower than the configured threshold.`,
        message: `Observed latency ${input.result.latencyMs}ms, threshold ${input.latencyThreshold}ms.`
      });

      await alertsService.queueIncidentOpenedAlert({
        projectId: input.projectId,
        apiId: input.apiId,
        incidentId: incident.id,
        subject: `[DeployWatch] Latency incident opened for ${input.apiName}`,
        body: `${input.apiName} exceeded the latency threshold with a ${input.result.latencyMs}ms response time.`
      });
      return;
    }

    if (input.latencyBreached && openIncident) {
      await incidentsRepository.updateIncidentStatus({
        incidentId: openIncident.id,
        status: IncidentStatus.MONITORING,
        message: `Latency remains elevated at ${input.result.latencyMs}ms.`
      });
      return;
    }

    if (!input.latencyBreached && openIncident) {
      await incidentsRepository.updateIncidentStatus({
        incidentId: openIncident.id,
        status: IncidentStatus.RESOLVED,
        resolvedAt: new Date(),
        message: `${input.apiName} latency returned below the configured threshold.`
      });

      await alertsService.queueIncidentResolvedAlert({
        projectId: input.projectId,
        apiId: input.apiId,
        incidentId: openIncident.id,
        subject: `[DeployWatch] Latency incident resolved for ${input.apiName}`,
        body: `${input.apiName} latency is healthy again.`
      });
    }
  }
}

export const monitoringService = new MonitoringService();
