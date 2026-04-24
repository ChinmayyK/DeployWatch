import { z } from "zod";

export const alertsParamsSchema = z.object({
  projectId: z.string().min(1)
});

export const updateAlertPolicyBodySchema = z.object({
  latencyThresholdMs: z.number().int().min(50).max(60_000),
  consecutiveFailureThreshold: z.number().int().min(1).max(20),
  emailEnabled: z.boolean(),
  emailRecipients: z.array(z.string().email()).default([]),
  slackEnabled: z.boolean(),
  webhookEnabled: z.boolean(),
  webhookUrl: z.string().url().optional()
});
