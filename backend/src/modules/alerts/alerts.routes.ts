import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validate-request";
import { asyncHandler } from "../../utils/async-handler";
import { alertsController } from "./alerts.controller";
import { alertsParamsSchema, updateAlertPolicyBodySchema } from "./alerts.schema";

export const alertsRoutes = Router({ mergeParams: true });

alertsRoutes.use(authenticate);
alertsRoutes.get("/", validateRequest({ params: alertsParamsSchema }), asyncHandler(alertsController.getPolicy));
alertsRoutes.put(
  "/",
  validateRequest({ params: alertsParamsSchema, body: updateAlertPolicyBodySchema }),
  asyncHandler(alertsController.updatePolicy)
);
