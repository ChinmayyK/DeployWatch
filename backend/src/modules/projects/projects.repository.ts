import { prisma } from "../../db/prisma";

export class ProjectsRepository {
  listOwnedProjects(ownerId: string) {
    return prisma.project.findMany({
      where: {
        ownerId
      },
      include: {
        _count: {
          select: {
            apis: true
          }
        },
        incidents: {
          where: {
            status: {
              in: ["OPEN", "MONITORING"]
            }
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  findOwnedProject(ownerId: string, projectId: string) {
    return prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId
      },
      include: {
        alertPolicy: true
      }
    });
  }

  createProject(ownerId: string, input: { name: string; slug: string; environment: "PRODUCTION" | "STAGING" | "SANDBOX"; description?: string }) {
    return prisma.project.create({
      data: {
        ownerId,
        name: input.name,
        slug: input.slug,
        environment: input.environment,
        description: input.description,
        alertPolicy: {
          create: {
            emailEnabled: false,
            emailRecipients: [],
            slackEnabled: false,
            webhookEnabled: false
          }
        }
      },
      include: {
        _count: {
          select: {
            apis: true
          }
        },
        incidents: {
          where: {
            status: {
              in: ["OPEN", "MONITORING"]
            }
          },
          select: {
            id: true
          }
        }
      }
    });
  }

  listProjectApis(ownerId: string, projectId: string) {
    return prisma.monitoredApi.findMany({
      where: {
        projectId,
        project: {
          ownerId
        }
      },
      include: {
        logs: {
          orderBy: {
            checkedAt: "desc"
          },
          take: 20
        },
        incidents: {
          where: {
            status: {
              in: ["OPEN", "MONITORING"]
            }
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  listRecentProjectLogs(ownerId: string, projectId: string, since: Date) {
    return prisma.apiCheckLog.findMany({
      where: {
        projectId,
        checkedAt: {
          gte: since
        },
        api: {
          project: {
            ownerId
          }
        }
      }
    });
  }

  countActiveIncidents(ownerId: string, projectId: string) {
    return prisma.incident.count({
      where: {
        projectId,
        status: {
          in: ["OPEN", "MONITORING"]
        },
        project: {
          ownerId
        }
      }
    });
  }
}

export const projectsRepository = new ProjectsRepository();
