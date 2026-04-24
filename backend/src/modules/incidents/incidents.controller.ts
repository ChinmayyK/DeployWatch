import type { Request, Response } from "express";

import { incidentsService } from "./incidents.service";

export class IncidentsController {
  list = async (request: Request, response: Response) => {
    const { projectId } = request.params as { projectId: string };
    const incidents = await incidentsService.listIncidents(
      request.auth!.userId,
      projectId,
      request.query as never
    );
    return response.status(200).json({
      incidents
    });
  };

  get = async (request: Request, response: Response) => {
    const { projectId, incidentId } = request.params as { projectId: string; incidentId: string };
    const incident = await incidentsService.getIncident(
      request.auth!.userId,
      projectId,
      incidentId
    );
    return response.status(200).json({
      incident
    });
  };
}

export const incidentsController = new IncidentsController();
