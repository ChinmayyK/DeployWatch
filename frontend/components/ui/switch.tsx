"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "hairline relative inline-flex h-8 w-14 items-center rounded-full border transition duration-200",
        checked
          ? "border-slate-950 bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)] shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
          : "border-[var(--border-strong)] bg-[linear-gradient(180deg,#e2e8f0_0%,#cfd8e3_100%)]",
      )}
    >
      <span
        className={cn(
          "absolute text-[9px] font-semibold uppercase tracking-[0.22em] transition",
          checked ? "left-3 text-white/70" : "right-3 text-slate-600",
        )}
      >
        {checked ? "On" : "Off"}
      </span>
      <span
        className={cn(
          "inline-block h-6 w-6 rounded-full bg-white shadow-[0_4px_12px_rgba(15,23,42,0.16)] transition",
          checked ? "translate-x-7" : "translate-x-1",
        )}
      />
    </button>
  );
}
