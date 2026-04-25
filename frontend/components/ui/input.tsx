import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-slate-950 shadow-[0_1px_2px_rgba(13,21,38,0.05)] outline-none transition",
        "placeholder:text-slate-400",
        "hover:border-[var(--border-strong)]",
        "focus:border-slate-400 focus:ring-2 focus:ring-slate-950/8",
        className,
      )}
      {...props}
    />
  );
}
