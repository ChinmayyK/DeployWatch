export type AuthMode = "login" | "signup";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type LogOutcome = "success" | "failure";
export type MonitoringStatus = "operational" | "degraded" | "down" | "paused";
export type IncidentSeverity = "critical" | "major" | "minor";
export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";
export type Environment = "production" | "staging" | "sandbox";
export type TimeRangeFilter = "24h" | "7d" | "30d";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserRecord extends User {
  password: string;
}

export interface Session {
  userId: string;
  name: string;
  email: string;
  token: string;
  activeProjectId?: string;
}

export interface HeaderEntry {
  id: string;
  key: string;
  value: string;
}

export interface AlertConfig {
  projectId: string;
  latencyThresholdMs: number;
  failureCountThreshold: number;
  emailRecipients: string[];
  emailEnabled: boolean;
}

export interface Project {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  environment: Environment;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonitoredApi {
  id: string;
  projectId: string;
  name: string;
  url: string;
  method: HttpMethod;
  headers: HeaderEntry[];
  body: string;
  intervalMinutes: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RequestLog {
  id: string;
  projectId: string;
  apiId: string;
  timestamp: string;
  statusCode: number;
  latencyMs: number;
  outcome: LogOutcome;
  errorMessage?: string;
}

export interface IncidentTimelineEntry {
  id: string;
  at: string;
  status: IncidentStatus;
  message: string;
}

export interface Incident {
  id: string;
  projectId: string;
  apiId: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedAt: string;
  resolvedAt?: string;
  timeline: IncidentTimelineEntry[];
}

export interface ApiHealthSnapshot {
  status: MonitoringStatus;
  uptimePercentage: number;
  averageLatencyMs: number;
  latestLatencyMs: number | null;
  lastCheckedAt: string | null;
  failedChecks: number;
  successfulChecks: number;
  lastStatusCode: number | null;
}

export interface ApiListItem extends MonitoredApi {
  health: ApiHealthSnapshot;
}

export interface DashboardOverview {
  uptimePercentage: number;
  averageLatencyMs: number;
  activeIncidents: number;
  apiCount: number;
}

export interface ProjectDashboard {
  project: Project;
  overview: DashboardOverview;
  apis: ApiListItem[];
}

export interface LatencyPoint {
  timestamp: string;
  latencyMs: number;
  outcome: LogOutcome;
}

export interface ApiDetail {
  api: ApiListItem;
  latencySeries: LatencyPoint[];
  statusHistory: RequestLog[];
  recentLogs: RequestLog[];
}

export interface LogsFilter {
  range: TimeRangeFilter;
  outcome: "all" | LogOutcome;
}

export interface ProjectWithAlertConfig extends Project {
  alertConfig: AlertConfig;
}

export interface Database {
  users: UserRecord[];
  projects: Project[];
  apis: MonitoredApi[];
  logs: RequestLog[];
  incidents: Incident[];
  alertConfigs: AlertConfig[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput extends LoginInput {
  name: string;
}

export interface ProjectInput {
  name: string;
  environment: Environment;
  description: string;
}

export interface ApiInput {
  name: string;
  url: string;
  method: HttpMethod;
  headers: HeaderEntry[];
  body: string;
  intervalMinutes: number;
  enabled: boolean;
}
