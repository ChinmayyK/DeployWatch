"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { headersToMultiline, parseHeadersInput } from "@/lib/utils";
import type { ApiInput, ApiListItem, HttpMethod } from "@/types";

const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const intervals = [1, 5, 15, 30, 60];

const initialState = {
  name: "",
  url: "",
  method: "GET" as HttpMethod,
  headers: "",
  body: "",
  intervalMinutes: 5,
  enabled: true,
};

function createFormState(api?: ApiListItem) {
  if (!api) {
    return initialState;
  }

  return {
    name: api.name,
    url: api.url,
    method: api.method,
    headers: headersToMultiline(api.headers),
    body: api.body,
    intervalMinutes: api.intervalMinutes,
    enabled: api.enabled,
  };
}

function ApiFormFields({
  api,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  api?: ApiListItem;
  pending: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (input: ApiInput) => void;
}) {
  const [form, setForm] = useState(() => createFormState(api));

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          name: form.name,
          url: form.url,
          method: form.method,
          headers: parseHeadersInput(form.headers),
          body: form.body,
          intervalMinutes: form.intervalMinutes,
          enabled: form.enabled,
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="panel-subtle hairline rounded-[22px] border border-[var(--border)] px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Method</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{form.method}</p>
        </div>
        <div className="panel-subtle hairline rounded-[22px] border border-[var(--border)] px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Cadence</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">Every {form.intervalMinutes} minute{form.intervalMinutes > 1 ? "s" : ""}</p>
        </div>
        <div className="panel-subtle hairline rounded-[22px] border border-[var(--border)] px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">State</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{form.enabled ? "Enabled" : "Paused"}</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-5">
          <div className="panel-subtle hairline rounded-[26px] border border-[var(--border)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Identity</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Display name">
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Identity Token Exchange"
                  required
                />
              </Field>
              <Field label="HTTP method">
                <Select
                  value={form.method}
                  onChange={(event) => setForm((current) => ({ ...current, method: event.target.value as HttpMethod }))}
                >
                  {methods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Endpoint URL">
                <Input
                  type="url"
                  value={form.url}
                  onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
                  placeholder="https://api.partner.com/v1/status"
                  required
                />
              </Field>
            </div>
          </div>

          <div className="panel-subtle hairline rounded-[26px] border border-[var(--border)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Request shape</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Headers" hint="One per line. Format: `Header-Name: value`">
                <Textarea
                  value={form.headers}
                  onChange={(event) => setForm((current) => ({ ...current, headers: event.target.value }))}
                  placeholder={"Authorization: Bearer <token>\nAccept: application/json"}
                  className="min-h-36"
                />
              </Field>
              <Field label="Request body" hint="Optional raw JSON payload for write endpoints.">
                <Textarea
                  value={form.body}
                  onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                  placeholder={'{\n  "event": "deployment.created"\n}'}
                  className="min-h-36 font-mono"
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel-subtle hairline rounded-[26px] border border-[var(--border)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Monitoring policy</p>
            <div className="mt-4">
              <Field label="Monitoring interval">
                <Select
                  value={String(form.intervalMinutes)}
                  onChange={(event) => setForm((current) => ({ ...current, intervalMinutes: Number(event.target.value) }))}
                >
                  {intervals.map((interval) => (
                    <option key={interval} value={interval}>
                      Every {interval} minute{interval > 1 ? "s" : ""}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-white/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Monitoring enabled</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                    Disable the monitor to retain configuration while stopping new checks.
                  </p>
                </div>
                <Switch
                  checked={form.enabled}
                  onCheckedChange={(enabled) => setForm((current) => ({ ...current, enabled }))}
                />
              </div>
            </div>
          </div>

          <div className="panel-subtle hairline rounded-[26px] border border-[var(--border)] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">What gets captured</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-muted)]">
              <li>Response time and status code for every check.</li>
              <li>Failure context for request or upstream errors.</li>
              <li>Signals used by incidents, dashboards, and alert thresholds.</li>
            </ul>
          </div>
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}

      <div className="flex justify-end gap-3 border-t border-[var(--border)]/80 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : api ? "Save changes" : "Create monitor"}
        </Button>
      </div>
    </form>
  );
}

export function ApiFormModal({
  open,
  api,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  api?: ApiListItem;
  pending: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (input: ApiInput) => void;
}) {
  const formKey = open ? api?.id ?? "create" : "closed";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={api ? "Edit API monitor" : "Add API monitor"}
      description="Define the request shape and monitoring cadence for this upstream dependency."
    >
      <ApiFormFields key={formKey} api={api} pending={pending} error={error} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}
