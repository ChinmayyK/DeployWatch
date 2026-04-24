import { ApiManagement } from "@/features/apis/api-management";

export default async function ApisPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ApiManagement projectId={projectId} />;
}
