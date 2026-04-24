import type { IncidentFilters } from "./incidents.types";
import { incidentsRepository } from "./incidents.repository";
import { projectsService } from "../projects/projects.service";
import { AppError } from "../../utils/http-error";

export class IncidentsService {
  async listIncidents(userId: string, projectId: string, filters: IncidentFilters) {
    await projectsService.assertProjectOwnership(userId, projectId);
    return incidentsRepository.listProjectIncidents(userId, projectId, filters);
  }

  async getIncident(userId: string, projectId: string, incidentId: string) {
    await projectsService.assertProjectOwnership(userId, projectId);
    const incident = await incidentsRepository.findIncidentById(userId, projectId, incidentId);
    if (!incident) {
      throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident was not found");
    }

    return incident;
  }
}

export const incidentsService = new IncidentsService();
