"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAlertConfigQuery, useAlertMutation, useProjectQuery } from "@/hooks/use-deploywatch";

export function AlertSettings({ projectId }: { projectId: string }) {
  const { data: project, isLoading: projectLoading } = useProjectQuery(projectId);
  const { data, isLoading, error } = useAlertConfigQuery(projectId);
  const updateAlertConfig = useAlertMutation(projectId);
  const [draft, setDraft] = useState<{
    latencyThresholdMs?: string;
    failureCountThreshold?: string;
    emailRecipients?: string;
    emailEnabled?: boolean;
  }>({});

  const values = useMemo(
    () => ({
      latencyThresholdMs: draft.latencyThresholdMs ?? String(data?.latencyThresholdMs ?? 450),
      failureCountThreshold: draft.failureCountThreshold ?? String(data?.failureCountThreshold ?? 3),
      emailRecipients: draft.emailRecipients ?? data?.emailRecipients.join("\n") ?? "",
      emailEnabled: draft.emailEnabled ?? data?.emailEnabled ?? false,
    }),
    [data?.emailEnabled, data?.emailRecipients, data?.failureCountThreshold, data?.latencyThresholdMs, draft],
  );

  if (isLoading || projectLoading) {
    return <LoadingState label="Loading alert settings..." />;
  }

  if (error instanceof Error) {
    return <ErrorState message={error.message} />;
  }

  const recipientCount = values.emailRecipients
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={project?.name ?? "Project"}
        title="Alert configuration"
        description="Define the thresholds that should trigger operator attention. Email delivery is modeled in the UI and ready to be wired to a backend notifier."
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="metric-shell">
          <CardContent className="p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Latency threshold</p>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {values.latencyThresholdMs}
              <span className="ml-1 text-lg font-medium text-[var(--text-muted)]">ms</span>
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Requests slower than this budget can trigger degraded signal handling.
            </p>
          </CardContent>
        </Card>
        <Card className="metric-shell">
          <CardContent className="p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Failure threshold</p>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">{values.failureCountThreshold}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Consecutive failures needed before an alert path should escalate.
            </p>
          </CardContent>
        </Card>
        <Card className="metric-shell">
          <CardContent className="p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Email routing</p>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950">{recipientCount}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              {values.emailEnabled ? "Email alerting is enabled for this workspace." : "Email delivery is currently disabled."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Thresholds" description="Adjust the signal levels that should create an alert event." />
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              updateAlertConfig.mutate({
                latencyThresholdMs: Number(values.latencyThresholdMs),
                failureCountThreshold: Number(values.failureCountThreshold),
                emailRecipients: values.emailRecipients
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
                emailEnabled: values.emailEnabled,
              }, {
                onSuccess: (saved) => {
                  setDraft({
                    latencyThresholdMs: String(saved.latencyThresholdMs),
                    failureCountThreshold: String(saved.failureCountThreshold),
                    emailRecipients: saved.emailRecipients.join("\n"),
                    emailEnabled: saved.emailEnabled,
                  });
                },
              });
            }}
          >
            <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
              <div className="space-y-5">
                <div className="panel-subtle hairline rounded-[26px] border border-[var(--border)] p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Detection policy</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label="Latency threshold (ms)">
                      <Input
                        type="number"
                        value={values.latencyThresholdMs}
                        onChange={(event) => setDraft((current) => ({ ...current, latencyThresholdMs: event.target.value }))}
                        min={50}
                      />
                    </Field>
                    <Field label="Failure count threshold">
                      <Input
                        type="number"
                        value={values.failureCountThreshold}
                        onChange={(event) => setDraft((current) => ({ ...current, failureCountThreshold: event.target.value }))}
                        min={1}
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Recipients" hint="One email address per line.">
                  <Textarea
                    value={values.emailRecipients}
                    onChange={(event) => setDraft((current) => ({ ...current, emailRecipients: event.target.value }))}
                    placeholder={"sre@company.com\noncall@company.com"}
                    className="min-h-40"
                  />
                </Field>
              </div>

              <div className="space-y-5">
                <div className="panel-subtle hairline rounded-[26px] border border-[var(--border)] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Email alerts</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                        UI-only for MVP. Recipients are stored and ready for backend delivery integration.
                      </p>
                    </div>
                    <Switch
                      checked={values.emailEnabled}
                      onCheckedChange={(emailEnabled) => setDraft((current) => ({ ...current, emailEnabled }))}
                    />
                  </div>
                </div>

                <div className="panel-subtle hairline rounded-[26px] border border-[var(--border)] p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Future channels</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-slate-700">
                      Email
                    </span>
                    <span className="inline-flex rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-slate-700">
                      Slack
                    </span>
                    <span className="inline-flex rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-slate-700">
                      Webhook
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
                    The configuration model is intentionally shaped for additional delivery targets once notifier integrations are introduced.
                  </p>
                </div>
              </div>
            </div>

            {updateAlertConfig.error instanceof Error ? <ErrorState message={updateAlertConfig.error.message} /> : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={updateAlertConfig.isPending}>
                {updateAlertConfig.isPending ? "Saving..." : "Save alert settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
