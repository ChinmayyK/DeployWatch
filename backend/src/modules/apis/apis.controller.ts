import type { Request, Response } from "express";

import { apisService } from "./apis.service";
import { AppError } from "../../utils/http-error";

export class ApisController {
  list = async (request: Request, response: Response) => {
    const { projectId } = request.params as { projectId: string };
    const apis = await apisService.listApis(request.auth!.userId, projectId);
    return response.status(200).json({
      apis
    });
  };

  get = async (request: Request, response: Response) => {
    const { projectId, apiId } = request.params as { projectId: string; apiId: string };
    try {
      const api = await apisService.getApi(request.auth!.userId, projectId, apiId);
      return response.status(200).json({ api });
    } catch {
      throw new AppError(404, "API_NOT_FOUND", "API was not found");
    }
  };

  create = async (request: Request, response: Response) => {
    const { projectId } = request.params as { projectId: string };
    const api = await apisService.createApi(request.auth!.userId, projectId, request.body);
    return response.status(201).json({ api });
  };

  update = async (request: Request, response: Response) => {
    const { projectId, apiId } = request.params as { projectId: string; apiId: string };
    try {
      const api = await apisService.updateApi(request.auth!.userId, projectId, apiId, request.body);
      return response.status(200).json({ api });
    } catch {
      throw new AppError(404, "API_NOT_FOUND", "API was not found");
    }
  };

  delete = async (request: Request, response: Response) => {
    const { projectId, apiId } = request.params as { projectId: string; apiId: string };
    try {
      await apisService.deleteApi(request.auth!.userId, projectId, apiId);
      return response.status(204).send();
    } catch {
      throw new AppError(404, "API_NOT_FOUND", "API was not found");
    }
  };
}

export const apisController = new ApisController();
