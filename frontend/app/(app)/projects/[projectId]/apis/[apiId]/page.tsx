import { ApiDetailView } from "@/features/apis/api-detail-view";

export default async function ApiDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; apiId: string }>;
}) {
  const { projectId, apiId } = await params;
  return <ApiDetailView projectId={projectId} apiId={apiId} />;
}
