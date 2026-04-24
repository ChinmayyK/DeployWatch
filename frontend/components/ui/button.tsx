import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-slate-950 bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)] text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.18)]",
  secondary:
    "border-[var(--border-strong)] bg-white/90 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:-translate-y-0.5 hover:bg-white",
  ghost:
    "border-transparent bg-transparent text-[var(--text-muted)] hover:bg-slate-100/80 hover:text-slate-900",
  danger:
    "border-rose-700 bg-[linear-gradient(180deg,#ef4444_0%,#dc2626_100%)] text-white shadow-[0_12px_24px_rgba(220,38,38,0.18)] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(220,38,38,0.2)]",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
