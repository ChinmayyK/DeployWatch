import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type {
  IncidentSeverity,
  IncidentStatus,
  MonitoringStatus,
  RequestLog,
  TimeRangeFilter,
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits > 0 ? maximumFractionDigits : 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${formatNumber(value, 1)}%`;
}

export function formatLatency(value: number | null) {
  if (value === null) {
    return "No checks";
  }

  return `${formatNumber(value)} ms`;
}

export function formatTimestamp(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDateTimeFull(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const diffMs = new Date(value).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 48) {
    return formatter.format(diffHours, "hour");
  }

  return formatter.format(Math.round(diffHours / 24), "day");
}

export function statusTone(status: MonitoringStatus) {
  switch (status) {
    case "operational":
      return "bg-emerald-500/12 text-emerald-700 ring-emerald-600/20";
    case "degraded":
      return "bg-amber-500/12 text-amber-700 ring-amber-600/20";
    case "down":
      return "bg-rose-500/12 text-rose-700 ring-rose-600/20";
    case "paused":
      return "bg-slate-500/10 text-slate-600 ring-slate-500/20";
  }
}

export function incidentSeverityTone(severity: IncidentSeverity) {
  switch (severity) {
    case "critical":
      return "bg-rose-500/12 text-rose-700 ring-rose-600/20";
    case "major":
      return "bg-amber-500/12 text-amber-700 ring-amber-600/20";
    case "minor":
      return "bg-sky-500/12 text-sky-700 ring-sky-600/20";
  }
}

export function incidentStatusTone(status: IncidentStatus) {
  switch (status) {
    case "investigating":
      return "bg-rose-500/12 text-rose-700 ring-rose-600/20";
    case "identified":
      return "bg-amber-500/12 text-amber-700 ring-amber-600/20";
    case "monitoring":
      return "bg-sky-500/12 text-sky-700 ring-sky-600/20";
    case "resolved":
      return "bg-emerald-500/12 text-emerald-700 ring-emerald-600/20";
  }
}

export function getRangeStart(range: TimeRangeFilter) {
  const now = Date.now();
  switch (range) {
    case "24h":
      return new Date(now - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
  }
}

export function statusLabelFromLog(log: RequestLog) {
  if (log.outcome === "failure") {
    return log.statusCode >= 500 ? "Server error" : "Request failure";
  }

  return "Healthy";
}

export function parseHeadersInput(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [key, ...rest] = line.split(":");
      return {
        id: `header_${index}_${key.trim()}`,
        key: key.trim(),
        value: rest.join(":").trim(),
      };
    })
    .filter((entry) => entry.key);
}

export function headersToMultiline(headers: { key: string; value: string }[]) {
  return headers.map((entry) => `${entry.key}: ${entry.value}`).join("\n");
}
