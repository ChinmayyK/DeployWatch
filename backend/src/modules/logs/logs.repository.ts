import type { Prisma } from "@prisma/client";

import { prisma } from "../../db/prisma";

export class LogsRepository {
  listProjectLogs(
    ownerId: string,
    projectId: string,
    filters: {
      apiId?: string;
      outcome?: "SUCCESS" | "FAILURE" | "TIMEOUT";
      from?: Date;
      to?: Date;
      limit: number;
    }
  ) {
    const where: Prisma.ApiCheckLogWhereInput = {
      projectId,
      api: {
        project: {
          ownerId
        }
      },
      apiId: filters.apiId,
      outcome: filters.outcome,
      checkedAt:
        filters.from || filters.to
          ? {
              gte: filters.from,
              lte: filters.to
            }
          : undefined
    };

    return prisma.apiCheckLog.findMany({
      where,
      include: {
        api: {
          select: {
            id: true,
            name: true,
            method: true,
            url: true
          }
        }
      },
      orderBy: {
        checkedAt: "desc"
      },
      take: filters.limit
    });
  }
}

export const logsRepository = new LogsRepository();
