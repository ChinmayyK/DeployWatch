import { LogsExplorer } from "@/features/logs/logs-explorer";

export default async function LogsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <LogsExplorer projectId={projectId} />;
}
