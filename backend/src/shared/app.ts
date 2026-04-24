import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { logger } from "../config/logger";
import { errorHandler } from "../middlewares/error-handler";
import { notFoundHandler } from "../middlewares/not-found";
import { requestContext } from "../middlewares/request-context";
import { authRoutes } from "../modules/auth/auth.routes";
import { projectsRoutes } from "../modules/projects/projects.routes";
import { apisRoutes } from "../modules/apis/apis.routes";
import { logsRoutes } from "../modules/logs/logs.routes";
import { incidentsRoutes } from "../modules/incidents/incidents.routes";
import { alertsRoutes } from "../modules/alerts/alerts.routes";
import { monitoringRoutes } from "../modules/monitoring/monitoring.routes";

export function createApp() {
  const app = express();

  app.use(requestContext);
  app.use(
    pinoHttp({
      logger,
      customProps: (request) => ({
        requestId: request.requestId
      })
    })
  );
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_request, response) => {
    return response.status(200).json({
      status: "ok"
    });
  });

  app.use("/v1/auth", authRoutes);
  app.use("/v1/projects", projectsRoutes);
  app.use("/v1/projects/:projectId/apis", apisRoutes);
  app.use("/v1/projects/:projectId/logs", logsRoutes);
  app.use("/v1/projects/:projectId/incidents", incidentsRoutes);
  app.use("/v1/projects/:projectId/alerts", alertsRoutes);
  app.use("/v1/monitoring", monitoringRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
