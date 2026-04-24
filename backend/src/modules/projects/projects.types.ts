import type { ProjectEnvironment } from "@prisma/client";

export interface CreateProjectInput {
  name: string;
  environment: ProjectEnvironment;
  description?: string;
}

export interface ProjectListItemDto {
  id: string;
  name: string;
  slug: string;
  environment: ProjectEnvironment;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  apiCount: number;
  activeIncidents: number;
}

export interface ProjectDashboardApiDto {
  id: string;
  name: string;
  url: string;
  method: string;
  enabled: boolean;
  intervalSeconds: number;
  health: {
    status: string;
    uptimePercentage: number;
    averageLatencyMs: number | null;
    latestLatencyMs: number | null;
    lastCheckedAt: Date | null;
    lastStatusCode: number | null;
    activeIncidents: number;
  };
}

export interface ProjectDashboardDto {
  project: {
    id: string;
    name: string;
    slug: string;
    environment: ProjectEnvironment;
    description: string | null;
  };
  overview: {
    uptimePercentage: number;
    averageLatencyMs: number | null;
    activeIncidents: number;
    totalApis: number;
  };
  apis: ProjectDashboardApiDto[];
}
