import type { IncidentSeverity, IncidentStatus } from "@prisma/client";

export interface IncidentFilters {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
}
