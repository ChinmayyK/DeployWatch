import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white",
        className,
      )}
      {...props}
    />
  );
}
