export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] w-full max-w-sm flex-col items-center justify-center gap-5 rounded-2xl border border-white/80 bg-white/90 px-8 py-10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_8px_24px_rgba(13,21,38,0.06)] ring-1 ring-slate-950/5">
      {/* Animated logo mark */}
      <div className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute h-10 w-10 animate-ping rounded-full bg-slate-200 opacity-60" style={{ animationDuration: "1.6s" }} />
        <svg viewBox="0 0 20 20" fill="none" className="relative h-5 w-5">
          <circle cx="10" cy="10" r="3" fill="#0f172a" />
          <circle cx="10" cy="10" r="7" stroke="#0f172a" strokeWidth="1.5" strokeOpacity="0.25" />
          <circle cx="10" cy="10" r="9.5" stroke="#0f172a" strokeWidth="1" strokeOpacity="0.1" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">DeployWatch</p>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">{label}</p>
      </div>
    </div>
  );
}
