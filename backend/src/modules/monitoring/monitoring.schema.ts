import { z } from "zod";

export const monitoringApiParamsSchema = z.object({
  projectId: z.string().min(1),
  apiId: z.string().min(1)
});
