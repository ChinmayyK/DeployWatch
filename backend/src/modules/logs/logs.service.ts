import type { LogsQueryInput } from "./logs.types";
import { logsRepository } from "./logs.repository";
import { projectsService } from "../projects/projects.service";

export class LogsService {
  async listLogs(userId: string, projectId: string, input: LogsQueryInput) {
    await projectsService.assertProjectOwnership(userId, projectId);

    return logsRepository.listProjectLogs(userId, projectId, {
      apiId: input.apiId,
      outcome: input.outcome,
      from: input.from ? new Date(input.from) : undefined,
      to: input.to ? new Date(input.to) : undefined,
      limit: input.limit
    });
  }
}

export const logsService = new LogsService();
