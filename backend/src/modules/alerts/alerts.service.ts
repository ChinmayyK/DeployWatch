import { AlertChannel } from "@prisma/client";

import { alertsRepository } from "./alerts.repository";
import type { UpdateAlertPolicyInput } from "./alerts.types";
import { projectsService } from "../projects/projects.service";
import { enqueueAlertDelivery } from "../../jobs/alert.job";
import { logger } from "../../config/logger";

export class AlertsService {
  async getPolicy(userId: string, projectId: string) {
    await projectsService.assertProjectOwnership(userId, projectId);
    const policy = await alertsRepository.findOwnedPolicy(userId, projectId);
    return policy;
  }

  async updatePolicy(userId: string, projectId: string, input: UpdateAlertPolicyInput) {
    await projectsService.assertProjectOwnership(userId, projectId);
    return alertsRepository.upsertPolicy(projectId, input);
  }

  async queueIncidentOpenedAlert(input: {
    projectId: string;
    apiId: string;
    incidentId: string;
    subject: string;
    body: string;
  }) {
    await this.queueNotifications({
      ...input,
      type: "incident.opened"
    });
  }

  async queueIncidentResolvedAlert(input: {
    projectId: string;
    apiId: string;
    incidentId: string;
    subject: string;
    body: string;
  }) {
    await this.queueNotifications({
      ...input,
      type: "incident.resolved"
    });
  }

  private async queueNotifications(input: {
    projectId: string;
    apiId: string;
    incidentId: string;
    type: string;
    subject: string;
    body: string;
  }) {
    const policy = await alertsRepository.findPolicyByProjectId(input.projectId);
    if (!policy) {
      return;
    }

    const channels: AlertChannel[] = [];
    if (policy.emailEnabled && policy.emailRecipients.length > 0) {
      channels.push(AlertChannel.EMAIL);
    }
    if (policy.slackEnabled) {
      channels.push(AlertChannel.SLACK);
    }
    if (policy.webhookEnabled && policy.webhookUrl) {
      channels.push(AlertChannel.WEBHOOK);
    }

    await Promise.all(
      channels.map(async (channel) => {
        const event = await alertsRepository.createAlertEvent({
          projectId: input.projectId,
          apiId: input.apiId,
          incidentId: input.incidentId,
          channel,
          type: input.type,
          subject: input.subject,
          body: input.body
        });

        await enqueueAlertDelivery({
          alertEventId: event.id
        });
      })
    );
  }

  async deliverAlert(alertEventId: string) {
    const event = await alertsRepository.findAlertEventById(alertEventId);
    if (!event) {
      return;
    }

    try {
      switch (event.channel) {
        case AlertChannel.EMAIL:
          logger.info(
            {
              recipients: event.project.alertPolicy?.emailRecipients ?? [],
              subject: event.subject,
              body: event.body
            },
            "Mock email alert delivered"
          );
          break;
        case AlertChannel.SLACK:
          logger.info({ subject: event.subject, body: event.body }, "Mock Slack alert delivered");
          break;
        case AlertChannel.WEBHOOK:
          logger.info(
            {
              webhookUrl: event.project.alertPolicy?.webhookUrl,
              subject: event.subject,
              body: event.body
            },
            "Mock webhook alert delivered"
          );
          break;
      }

      await alertsRepository.updateAlertEventStatus(alertEventId, "SENT");
    } catch (error) {
      await alertsRepository.updateAlertEventStatus(
        alertEventId,
        "FAILED",
        error instanceof Error ? error.message : "Unknown delivery error"
      );
      throw error;
    }
  }
}

export const alertsService = new AlertsService();
