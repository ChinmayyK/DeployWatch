import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-slate-900/80 bg-slate-950 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_8px_20px_rgba(15,23,42,0.2)] hover:bg-slate-800 hover:-translate-y-px active:translate-y-0 active:shadow-none",
  secondary:
    "border-[var(--border)] bg-white text-slate-800 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_2px_8px_rgba(13,21,38,0.06)] hover:bg-slate-50 hover:-translate-y-px active:translate-y-0",
  ghost:
    "border-transparent bg-transparent text-[var(--text-muted)] hover:bg-slate-100 hover:text-slate-900",
  danger:
    "border-rose-600 bg-rose-600 text-white shadow-[0_8px_20px_rgba(220,38,38,0.2)] hover:bg-rose-500 hover:-translate-y-px active:translate-y-0",
};

const sizes: Record<"sm" | "md", string> = {
  sm: "h-8 rounded-xl px-3 text-xs",
  md: "h-10 rounded-xl px-4 text-sm",
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center border font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
