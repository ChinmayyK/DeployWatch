export interface UpdateAlertPolicyInput {
  latencyThresholdMs: number;
  consecutiveFailureThreshold: number;
  emailEnabled: boolean;
  emailRecipients: string[];
  slackEnabled: boolean;
  webhookEnabled: boolean;
  webhookUrl?: string;
}
