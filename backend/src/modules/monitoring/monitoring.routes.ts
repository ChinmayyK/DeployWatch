import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validate-request";
import { asyncHandler } from "../../utils/async-handler";
import { monitoringController } from "./monitoring.controller";
import { monitoringApiParamsSchema } from "./monitoring.schema";

export const monitoringRoutes = Router();

monitoringRoutes.use(authenticate);
monitoringRoutes.get("/health", asyncHandler(monitoringController.health));
monitoringRoutes.post(
  "/projects/:projectId/apis/:apiId/run",
  validateRequest({ params: monitoringApiParamsSchema }),
  asyncHandler(monitoringController.triggerRun)
);
