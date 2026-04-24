import { AlertSettings } from "@/features/alerts/alert-settings";

export default async function AlertsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <AlertSettings projectId={projectId} />;
}
