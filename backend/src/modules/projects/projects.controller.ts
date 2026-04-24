import type { Request, Response } from "express";

import { projectsService } from "./projects.service";

export class ProjectsController {
  list = async (request: Request, response: Response) => {
    const projects = await projectsService.listProjects(request.auth!.userId);
    return response.status(200).json({
      projects
    });
  };

  create = async (request: Request, response: Response) => {
    const project = await projectsService.createProject(request.auth!.userId, request.body);
    return response.status(201).json({
      project
    });
  };

  dashboard = async (request: Request, response: Response) => {
    const { projectId } = request.params as { projectId: string };
    const dashboard = await projectsService.getDashboard(request.auth!.userId, projectId);
    return response.status(200).json(dashboard);
  };
}

export const projectsController = new ProjectsController();
