import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validate-request";
import { asyncHandler } from "../../utils/async-handler";
import { incidentsController } from "./incidents.controller";
import { incidentParamsSchema, incidentsProjectParamsSchema, incidentsQuerySchema } from "./incidents.schema";

export const incidentsRoutes = Router({ mergeParams: true });

incidentsRoutes.use(authenticate);
incidentsRoutes.get(
  "/",
  validateRequest({ params: incidentsProjectParamsSchema, query: incidentsQuerySchema }),
  asyncHandler(incidentsController.list)
);
incidentsRoutes.get(
  "/:incidentId",
  validateRequest({ params: incidentParamsSchema }),
  asyncHandler(incidentsController.get)
);
