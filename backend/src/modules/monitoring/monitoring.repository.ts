import type { Prisma } from "@prisma/client";

import { prisma } from "../../db/prisma";
import { addSeconds } from "../../utils/time";

export class MonitoringRepository {
  async claimDueApis(limit: number) {
    const now = new Date();
    const apis = await prisma.monitoredApi.findMany({
      where: {
        enabled: true,
        nextCheckAt: {
          lte: now
        }
      },
      select: {
        id: true,
        projectId: true,
        monitoringIntervalSeconds: true
      },
      orderBy: {
        nextCheckAt: "asc"
      },
      take: limit
    });

    await prisma.$transaction(
      apis.map((api) =>
        prisma.monitoredApi.update({
          where: {
            id: api.id
          },
          data: {
            nextCheckAt: addSeconds(now, api.monitoringIntervalSeconds)
          }
        })
      )
    );

    return apis;
  }

  getApiForExecution(apiId: string) {
    return prisma.monitoredApi.findUnique({
      where: {
        id: apiId
      },
      include: {
        project: {
          include: {
            alertPolicy: true
          }
        }
      }
    });
  }

  getOwnedApiForExecution(ownerId: string, projectId: string, apiId: string) {
    return prisma.monitoredApi.findFirst({
      where: {
        id: apiId,
        projectId,
        project: {
          ownerId
        }
      }
    });
  }

  createCheckLog(input: {
    projectId: string;
    apiId: string;
    responseTimeMs: number;
    statusCode: number | null;
    outcome: "SUCCESS" | "FAILURE" | "TIMEOUT";
    errorMessage: string | null;
    responseHeaders?: Record<string, string>;
    requestSnapshot: Record<string, unknown>;
  }) {
    return prisma.apiCheckLog.create({
      data: {
        projectId: input.projectId,
        apiId: input.apiId,
        responseTimeMs: input.responseTimeMs,
        statusCode: input.statusCode,
        outcome: input.outcome,
        errorMessage: input.errorMessage,
        responseHeaders: (input.responseHeaders ?? {}) as Prisma.InputJsonValue,
        requestSnapshot: input.requestSnapshot as Prisma.InputJsonValue
      }
    });
  }

  updateApiAfterCheck(input: {
    apiId: string;
    status: "OPERATIONAL" | "DEGRADED" | "DOWN" | "PAUSED";
    consecutiveFailures: number;
    lastCheckedAt: Date;
    lastStatusCode: number | null;
    lastLatencyMs: number;
    lastError: string | null;
  }) {
    return prisma.monitoredApi.update({
      where: {
        id: input.apiId
      },
      data: {
        status: input.status,
        consecutiveFailures: input.consecutiveFailures,
        lastCheckedAt: input.lastCheckedAt,
        lastStatusCode: input.lastStatusCode,
        lastLatencyMs: input.lastLatencyMs,
        lastError: input.lastError
      }
    });
  }

  countDueApis() {
    return prisma.monitoredApi.count({
      where: {
        enabled: true,
        nextCheckAt: {
          lte: new Date()
        }
      }
    });
  }

  countEnabledApis() {
    return prisma.monitoredApi.count({
      where: {
        enabled: true
      }
    });
  }
}

export const monitoringRepository = new MonitoringRepository();
