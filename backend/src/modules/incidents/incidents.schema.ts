import { IncidentSeverity, IncidentStatus } from "@prisma/client";
import { z } from "zod";

export const incidentsProjectParamsSchema = z.object({
  projectId: z.string().min(1)
});

export const incidentParamsSchema = z.object({
  projectId: z.string().min(1),
  incidentId: z.string().min(1)
});

export const incidentsQuerySchema = z.object({
  status: z.nativeEnum(IncidentStatus).optional(),
  severity: z.nativeEnum(IncidentSeverity).optional()
});
