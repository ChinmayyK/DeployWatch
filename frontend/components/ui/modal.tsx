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
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in" />

      {/* Panel */}
      <div
        className={cn(
          "animate-modal-enter relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_32px_80px_rgba(13,21,38,0.2)] ring-1 ring-slate-950/5",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border)]/70 px-6 py-5">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
