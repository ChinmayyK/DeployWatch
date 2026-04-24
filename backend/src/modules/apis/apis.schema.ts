import { HttpMethod } from "@prisma/client";
import { z } from "zod";

export const projectApiParamsSchema = z.object({
  projectId: z.string().min(1)
});

export const apiParamsSchema = z.object({
  projectId: z.string().min(1),
  apiId: z.string().min(1)
});

const apiInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  url: z.string().url(),
  method: z.nativeEnum(HttpMethod),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().max(10_000).optional(),
  monitoringIntervalSeconds: z.number().int().min(60).max(86_400),
  timeoutMs: z.number().int().min(1_000).max(60_000).optional(),
  enabled: z.boolean().optional(),
  latencyThresholdMs: z.number().int().min(50).max(60_000).optional(),
  failureThreshold: z.number().int().min(1).max(20).optional()
});

export const createApiBodySchema = apiInputSchema;
export const updateApiBodySchema = apiInputSchema.partial();
