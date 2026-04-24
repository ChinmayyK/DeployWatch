import type { Prisma } from "@prisma/client";

import { prisma } from "../../db/prisma";

export class ApisRepository {
  listOwnedApis(ownerId: string, projectId: string) {
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

  findOwnedApi(ownerId: string, projectId: string, apiId: string) {
    return prisma.monitoredApi.findFirst({
      where: {
        id: apiId,
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
      }
    });
  }

  createApi(projectId: string, data: Prisma.MonitoredApiUncheckedCreateInput) {
    return prisma.monitoredApi.create({
      data,
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
      }
    });
  }

  updateApi(apiId: string, data: Prisma.MonitoredApiUncheckedUpdateInput) {
    return prisma.monitoredApi.update({
      where: {
        id: apiId
      },
      data,
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
      }
    });
  }

  deleteApi(apiId: string) {
    return prisma.monitoredApi.delete({
      where: {
        id: apiId
      }
    });
  }
}

export const apisRepository = new ApisRepository();
