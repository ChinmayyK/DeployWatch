import { AlertCircle } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
      <div>
        <p className="text-sm font-semibold text-rose-900">{title}</p>
        <p className="mt-0.5 text-sm text-rose-700">{message}</p>
      </div>
    </div>
  );
}
