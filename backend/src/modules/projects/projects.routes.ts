import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validate-request";
import { asyncHandler } from "../../utils/async-handler";
import { projectsController } from "./projects.controller";
import { createProjectBodySchema, projectParamsSchema } from "./projects.schema";

export const projectsRoutes = Router();

projectsRoutes.use(authenticate);
projectsRoutes.get("/", asyncHandler(projectsController.list));
projectsRoutes.post("/", validateRequest({ body: createProjectBodySchema }), asyncHandler(projectsController.create));
projectsRoutes.get(
  "/:projectId/dashboard",
  validateRequest({ params: projectParamsSchema }),
  asyncHandler(projectsController.dashboard)
);
