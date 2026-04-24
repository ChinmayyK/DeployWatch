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
    <section className="surface-glow relative overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(243,247,251,0.96)_54%,rgba(232,239,246,0.9)_100%)] p-6 md:p-8">
      <div className="absolute right-[-30px] top-[-28px] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(37,99,235,0)_72%)]" />
      <div className="absolute bottom-[-32px] left-[-24px] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0)_72%)]" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">{eyebrow}</p>
          ) : null}
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-[2.6rem]">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)] md:text-[15px]">{description}</p>
        </div>
        {action ? <div className="relative z-10">{action}</div> : null}
      </div>
    </section>
  );
}
