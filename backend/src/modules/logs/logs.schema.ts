import { RequestOutcome } from "@prisma/client";
import { z } from "zod";

export const logsParamsSchema = z.object({
  projectId: z.string().min(1)
});

export const logsQuerySchema = z.object({
  apiId: z.string().optional(),
  outcome: z.nativeEnum(RequestOutcome).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100)
});
