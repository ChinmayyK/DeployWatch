import type { Request, Response } from "express";

import { alertsService } from "./alerts.service";

export class AlertsController {
  getPolicy = async (request: Request, response: Response) => {
    const { projectId } = request.params as { projectId: string };
    const policy = await alertsService.getPolicy(request.auth!.userId, projectId);
    return response.status(200).json({
      policy
    });
  };

  updatePolicy = async (request: Request, response: Response) => {
    const { projectId } = request.params as { projectId: string };
    const policy = await alertsService.updatePolicy(request.auth!.userId, projectId, request.body);
    return response.status(200).json({
      policy
    });
  };
}

export const alertsController = new AlertsController();
