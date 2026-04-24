import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validate-request";
import { asyncHandler } from "../../utils/async-handler";
import { logsController } from "./logs.controller";
import { logsParamsSchema, logsQuerySchema } from "./logs.schema";

export const logsRoutes = Router({ mergeParams: true });

logsRoutes.use(authenticate);
logsRoutes.get(
  "/",
  validateRequest({ params: logsParamsSchema, query: logsQuerySchema }),
  asyncHandler(logsController.list)
);
