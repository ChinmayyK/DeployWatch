import { DashboardView } from "@/features/dashboard/dashboard-view";

export default async function DashboardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <DashboardView projectId={projectId} />;
}
