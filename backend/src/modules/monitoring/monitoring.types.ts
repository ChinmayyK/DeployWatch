export interface MonitoringCheckExecutionResult {
  success: boolean;
  statusCode: number | null;
  latencyMs: number;
  errorMessage: string | null;
  timedOut: boolean;
}
