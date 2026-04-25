export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl border border-white/80 bg-white/90 px-6 py-7 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_8px_24px_rgba(13,21,38,0.06)] ring-1 ring-slate-950/5 md:px-8 md:py-8">
      {/* Decorative radial */}
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.07)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 -translate-x-1/4 translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.04)_0%,transparent_70%)]" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">{eyebrow}</p>
          ) : null}
          <h1 className={`font-semibold tracking-tight text-slate-950 ${eyebrow ? "mt-2" : ""} text-2xl md:text-3xl`}>
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-muted)]">{description}</p>
        </div>
        {action ? <div className="relative z-10 shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}
