import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validate-request";
import { asyncHandler } from "../../utils/async-handler";
import { apisController } from "./apis.controller";
import { apiParamsSchema, createApiBodySchema, projectApiParamsSchema, updateApiBodySchema } from "./apis.schema";

export const apisRoutes = Router({ mergeParams: true });

apisRoutes.use(authenticate);
apisRoutes.get("/", validateRequest({ params: projectApiParamsSchema }), asyncHandler(apisController.list));
apisRoutes.post(
  "/",
  validateRequest({ params: projectApiParamsSchema, body: createApiBodySchema }),
  asyncHandler(apisController.create)
);
apisRoutes.get("/:apiId", validateRequest({ params: apiParamsSchema }), asyncHandler(apisController.get));
apisRoutes.patch(
  "/:apiId",
  validateRequest({ params: apiParamsSchema, body: updateApiBodySchema }),
  asyncHandler(apisController.update)
);
apisRoutes.delete("/:apiId", validateRequest({ params: apiParamsSchema }), asyncHandler(apisController.delete));
