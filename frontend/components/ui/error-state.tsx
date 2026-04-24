export function ErrorState({
  title = "Something went wrong",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="rounded-[24px] border border-rose-200 bg-[linear-gradient(180deg,#fff7f7_0%,#ffefef_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-rose-800">{message}</p>
    </div>
  );
}
