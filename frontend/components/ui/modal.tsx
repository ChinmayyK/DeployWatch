"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  className,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-md">
      <div
        className={cn(
          "animate-modal-enter surface-glow w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,249,252,0.94)_100%)]",
          className,
        )}
      >
        <div className="relative flex items-start justify-between border-b border-[var(--border)]/80 px-6 py-5">
          <div className="absolute inset-x-0 top-0 h-px bg-white/80" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--text-muted)]">Configuration</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{title}</h3>
            {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border)] hover:bg-white hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
