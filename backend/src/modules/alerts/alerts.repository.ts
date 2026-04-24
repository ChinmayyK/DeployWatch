import type { AlertChannel, AlertDeliveryStatus, Prisma } from "@prisma/client";

import { prisma } from "../../db/prisma";

export class AlertsRepository {
  findOwnedPolicy(ownerId: string, projectId: string) {
    return prisma.alertPolicy.findFirst({
      where: {
        projectId,
        project: {
          ownerId
        }
      }
    });
  }

  findPolicyByProjectId(projectId: string) {
    return prisma.alertPolicy.findUnique({
      where: {
        projectId
      }
    });
  }

  upsertPolicy(projectId: string, data: {
    latencyThresholdMs: number;
    consecutiveFailureThreshold: number;
    emailEnabled: boolean;
    emailRecipients: string[];
    slackEnabled: boolean;
    webhookEnabled: boolean;
    webhookUrl?: string;
  }) {
    return prisma.alertPolicy.upsert({
      where: {
        projectId
      },
      create: {
        projectId,
        ...data
      },
      update: data
    });
  }

  createAlertEvent(input: {
    projectId: string;
    apiId?: string;
    incidentId?: string;
    channel: AlertChannel;
    type: string;
    subject: string;
    body: string;
  }) {
    return prisma.alertEvent.create({
      data: input
    });
  }

  findAlertEventById(alertEventId: string) {
    return prisma.alertEvent.findUnique({
      where: {
        id: alertEventId
      },
      include: {
        project: {
          include: {
            alertPolicy: true
          }
        },
        incident: {
          include: {
            api: true
          }
        }
      }
    });
  }

  updateAlertEventStatus(alertEventId: string, status: AlertDeliveryStatus, deliveryError?: string | null) {
    return prisma.alertEvent.update({
      where: {
        id: alertEventId
      },
      data: {
        deliveryStatus: status,
        deliveryError,
        deliveredAt: status === "SENT" ? new Date() : undefined
      }
    });
  }
}

export const alertsRepository = new AlertsRepository();
