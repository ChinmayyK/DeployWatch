export function LoadingState({ label = "Loading workspace..." }: { label?: string }) {
  return (
    <div className="surface-glow flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(246,249,252,0.92)_100%)]">
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-900" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-500 [animation-delay:120ms]" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-300 [animation-delay:240ms]" />
      </div>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">DeployWatch</p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
