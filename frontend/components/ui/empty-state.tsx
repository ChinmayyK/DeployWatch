import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface-glow flex min-h-72 flex-col items-center justify-center rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(246,249,252,0.9)_100%)] px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
