export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-950">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-xs leading-5 text-[var(--text-muted)]">{hint}</span> : null}
    </label>
  );
}
