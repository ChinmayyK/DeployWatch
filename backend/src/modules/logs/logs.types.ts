import type { RequestOutcome } from "@prisma/client";

export interface LogsQueryInput {
  apiId?: string;
  outcome?: RequestOutcome;
  from?: string;
  to?: string;
  limit: number;
}
