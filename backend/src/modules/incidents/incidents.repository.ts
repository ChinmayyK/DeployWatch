import type { IncidentKind, IncidentSeverity, IncidentStatus, Prisma } from "@prisma/client";

import { prisma } from "../../db/prisma";

export class IncidentsRepository {
  listProjectIncidents(
    ownerId: string,
    projectId: string,
    filters: {
      status?: IncidentStatus;
      severity?: IncidentSeverity;
    }
  ) {
    return prisma.incident.findMany({
      where: {
        projectId,
        status: filters.status,
        severity: filters.severity,
        project: {
          ownerId
        }
      },
      include: {
        api: {
          select: {
            id: true,
            name: true,
            method: true,
            url: true
          }
        },
        events: {
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: {
        openedAt: "desc"
      }
    });
  }

  findIncidentById(ownerId: string, projectId: string, incidentId: string) {
    return prisma.incident.findFirst({
      where: {
        id: incidentId,
        projectId,
        project: {
          ownerId
        }
      },
      include: {
        api: {
          select: {
            id: true,
            name: true,
            method: true,
            url: true
          }
        },
        events: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
  }

  findOpenIncident(apiId: string, kind: IncidentKind) {
    return prisma.incident.findFirst({
      where: {
        apiId,
        kind,
        status: {
          in: ["OPEN", "MONITORING"]
        }
      },
      orderBy: {
        openedAt: "desc"
      }
    });
  }

  createIncident(input: {
    projectId: string;
    apiId: string;
    kind: IncidentKind;
    severity: IncidentSeverity;
    title: string;
    summary: string;
    message: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.incident.create({
      data: {
        projectId: input.projectId,
        apiId: input.apiId,
        kind: input.kind,
        severity: input.severity,
        status: "OPEN",
        title: input.title,
        summary: input.summary,
        events: {
          create: {
            status: "OPEN",
            message: input.message,
            metadata: input.metadata
          }
        }
      }
    });
  }

  updateIncidentStatus(input: {
    incidentId: string;
    status: IncidentStatus;
    message: string;
    metadata?: Prisma.InputJsonValue;
    resolvedAt?: Date;
  }) {
    return prisma.$transaction(async (transaction) => {
      const incident = await transaction.incident.update({
        where: {
          id: input.incidentId
        },
        data: {
          status: input.status,
          resolvedAt: input.resolvedAt
        }
      });

      await transaction.incidentEvent.create({
        data: {
          incidentId: input.incidentId,
          status: input.status,
          message: input.message,
          metadata: input.metadata
        }
      });

      return incident;
    });
  }
}

export const incidentsRepository = new IncidentsRepository();
