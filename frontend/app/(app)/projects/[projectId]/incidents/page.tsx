import { IncidentsOverview } from "@/features/incidents/incidents-overview";

export default async function IncidentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <IncidentsOverview projectId={projectId} />;
}
