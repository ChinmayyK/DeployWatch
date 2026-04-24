import type { Request, Response } from "express";

import { logsService } from "./logs.service";

export class LogsController {
  list = async (request: Request, response: Response) => {
    const { projectId } = request.params as { projectId: string };
    const logs = await logsService.listLogs(request.auth!.userId, projectId, request.query as never);
    return response.status(200).json({
      logs
    });
  };
}

export const logsController = new LogsController();
