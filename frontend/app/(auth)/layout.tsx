export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="relative z-10 mx-auto grid w-full max-w-[1380px] gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-glow hidden rounded-[36px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96)_0%,rgba(242,247,252,0.94)_46%,rgba(229,236,244,0.9)_100%)] p-8 xl:block">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">DeployWatch</p>
          <h1 className="mt-5 max-w-xl text-[3.2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950">
            Treat every external API like production infrastructure.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-[var(--text-muted)]">
            A cleaner control plane for response times, incident posture, and operational trust across third-party dependencies.
          </p>

          <div className="mt-10 grid gap-4">
            <div className="rounded-[26px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Latency posture</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">184 ms</p>
                </div>
                <div className="flex gap-1">
                  {[42, 56, 38, 72, 44, 51, 36, 48].map((height, index) => (
                    <span
                      key={`${height}-${index}`}
                      className="w-2 rounded-full bg-[linear-gradient(180deg,#2563eb_0%,#1d4ed8_100%)] opacity-90"
                      style={{ height }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Uptime", "99.96%"],
                ["Active incidents", "2"],
                ["Checks / min", "480"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[24px] border border-white/80 bg-white/75 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">{label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="relative flex items-center justify-center">{children}</div>
      </div>
    </main>
  );
}
