import { ProjectEnvironment } from "@prisma/client";
import { z } from "zod";

export const createProjectBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  environment: z.nativeEnum(ProjectEnvironment),
  description: z.string().trim().max(500).optional()
});

export const projectParamsSchema = z.object({
  projectId: z.string().min(1)
});
