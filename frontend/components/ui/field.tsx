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
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-slate-800">{label}</span>
      {children}
      {hint ? <span className="block text-xs leading-5 text-[var(--text-muted)]">{hint}</span> : null}
    </label>
  );
}
