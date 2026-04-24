import { IncidentDetailView } from "@/features/incidents/incident-detail-view";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; incidentId: string }>;
}) {
  const { projectId, incidentId } = await params;
  return <IncidentDetailView projectId={projectId} incidentId={incidentId} />;
}
