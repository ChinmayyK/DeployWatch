import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  MONITORING_DISPATCHER_INTERVAL_MS: z.coerce.number().int().positive().default(60_000),
  MONITORING_BATCH_LIMIT: z.coerce.number().int().positive().default(100),
  HTTP_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  EMAIL_FROM: z.string().email().default("alerts@deploywatch.local"),
  API_BASE_URL: z.string().url().default("http://localhost:4000")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
