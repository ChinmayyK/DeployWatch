import { RequestOutcome } from "@prisma/client";

import { projectsRepository } from "./projects.repository";
import type { CreateProjectInput, ProjectDashboardDto, ProjectListItemDto } from "./projects.types";
import { AppError } from "../../utils/http-error";
import { slugify } from "../../utils/slug";
import { calculateApiHealthSnapshot } from "../../shared/health";

export class ProjectsService {
  async listProjects(userId: string): Promise<ProjectListItemDto[]> {
    const projects = await projectsRepository.listOwnedProjects(userId);

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      slug: project.slug,
      environment: project.environment,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      apiCount: project._count.apis,
      activeIncidents: project.incidents.length
    }));
  }

  async createProject(userId: string, input: CreateProjectInput): Promise<ProjectListItemDto> {
    const project = await projectsRepository.createProject(userId, {
      name: input.name,
      slug: slugify(input.name),
      environment: input.environment,
      description: input.description
    });

    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      environment: project.environment,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      apiCount: project._count.apis,
      activeIncidents: project.incidents.length
    };
  }

  async getDashboard(userId: string, projectId: string): Promise<ProjectDashboardDto> {
    const project = await projectsRepository.findOwnedProject(userId, projectId);
    if (!project) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project was not found");
    }

    const [apis, recentLogs, activeIncidents] = await Promise.all([
      projectsRepository.listProjectApis(userId, projectId),
      projectsRepository.listRecentProjectLogs(userId, projectId, new Date(Date.now() - 24 * 60 * 60 * 1000)),
      projectsRepository.countActiveIncidents(userId, projectId)
    ]);

    const apiDtos = apis.map((api) => ({
      id: api.id,
      name: api.name,
      url: api.url,
      method: api.method,
      enabled: api.enabled,
      intervalSeconds: api.monitoringIntervalSeconds,
      health: calculateApiHealthSnapshot(api.logs, api.enabled ? api.status : "PAUSED", api.incidents.length)
    }));

    const successfulLogs = recentLogs.filter((log) => log.outcome === RequestOutcome.SUCCESS);
    const uptimePercentage =
      recentLogs.length > 0 ? (successfulLogs.length / recentLogs.length) * 100 : 0;
    const averageLatencyMs =
      successfulLogs.length > 0
        ? Math.round(
            successfulLogs.reduce((sum, log) => sum + log.responseTimeMs, 0) / successfulLogs.length
          )
        : null;

    return {
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        environment: project.environment,
        description: project.description
      },
      overview: {
        uptimePercentage,
        averageLatencyMs,
        activeIncidents,
        totalApis: apis.length
      },
      apis: apiDtos
    };
  }

  async assertProjectOwnership(userId: string, projectId: string) {
    const project = await projectsRepository.findOwnedProject(userId, projectId);
    if (!project) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project was not found");
    }

    return project;
  }
}

export const projectsService = new ProjectsService();
