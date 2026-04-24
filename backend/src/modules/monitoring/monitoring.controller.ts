import type { Request, Response } from "express";

import { monitoringService } from "./monitoring.service";

export class MonitoringController {
  triggerRun = async (request: Request, response: Response) => {
    const { projectId, apiId } = request.params as { projectId: string; apiId: string };
    await monitoringService.queueManualRun(
      request.auth!.userId,
      projectId,
      apiId
    );

    return response.status(202).json({
      queued: true
    });
  };

  health = async (_request: Request, response: Response) => {
    const summary = await monitoringService.getHealthSummary();
    return response.status(200).json(summary);
  };
}

export const monitoringController = new MonitoringController();
