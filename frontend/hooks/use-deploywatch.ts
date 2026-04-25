"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deploywatchApi } from "@/services/deploywatch-api";
import type {
  AlertConfig,
  ApiDetail,
  ApiInput,
  ApiListItem,
  Incident,
  LogsFilter,
  LoginInput,
  ProjectDashboard,
  ProjectInput,
  ProjectWithAlertConfig,
  Session,
  SignupInput,
} from "@/types";

export const queryKeys = {
  session: ["session"] as const,
  projects: ["projects"] as const,
  project: (projectId: string) => ["projects", projectId] as const,
  dashboard: (projectId: string) => ["dashboard", projectId] as const,
  apis: (projectId: string) => ["apis", projectId] as const,
  apiDetail: (projectId: string, apiId: string) => ["apis", projectId, apiId] as const,
  incidents: (projectId: string) => ["incidents", projectId] as const,
  incident: (projectId: string, incidentId: string) => ["incidents", projectId, incidentId] as const,
  logs: (projectId: string, filter: LogsFilter) => ["logs", projectId, filter.range, filter.outcome] as const,
  alerts: (projectId: string) => ["alerts", projectId] as const,
};

export function useSessionQuery() {
  return useQuery<Session | null>({
    queryKey: queryKeys.session,
    queryFn: () => deploywatchApi.getSession(),
    retry: false,
    staleTime: 60_000,
  });
}

export function useProjectsQuery() {
  const { data: session } = useSessionQuery();
  return useQuery<ProjectWithAlertConfig[]>({
    queryKey: queryKeys.projects,
    queryFn: () => deploywatchApi.getProjects(),
    enabled: Boolean(session),
  });
}

export function useProjectQuery(projectId: string) {
  return useQuery<ProjectWithAlertConfig>({
    queryKey: queryKeys.project(projectId),
    queryFn: () => deploywatchApi.getProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useDashboardQuery(projectId: string) {
  return useQuery<ProjectDashboard>({
    queryKey: queryKeys.dashboard(projectId),
    queryFn: () => deploywatchApi.getProjectDashboard(projectId),
    enabled: Boolean(projectId),
  });
}

export function useApisQuery(projectId: string) {
  return useQuery<ApiListItem[]>({
    queryKey: queryKeys.apis(projectId),
    queryFn: () => deploywatchApi.getApis(projectId),
    enabled: Boolean(projectId),
  });
}

export function useApiDetailQuery(projectId: string, apiId: string) {
  return useQuery<ApiDetail>({
    queryKey: queryKeys.apiDetail(projectId, apiId),
    queryFn: () => deploywatchApi.getApiDetail(projectId, apiId),
    enabled: Boolean(projectId && apiId),
  });
}

export function useIncidentsQuery(projectId: string) {
  return useQuery<Incident[]>({
    queryKey: queryKeys.incidents(projectId),
    queryFn: () => deploywatchApi.getIncidents(projectId),
    enabled: Boolean(projectId),
  });
}

export function useIncidentQuery(projectId: string, incidentId: string) {
  return useQuery<Incident>({
    queryKey: queryKeys.incident(projectId, incidentId),
    queryFn: () => deploywatchApi.getIncident(projectId, incidentId),
    enabled: Boolean(projectId && incidentId),
  });
}

export function useLogsQuery(projectId: string, filter: LogsFilter) {
  return useQuery<any[]>({
    queryKey: queryKeys.logs(projectId, filter),
    queryFn: () => deploywatchApi.getLogs(projectId, filter),
    enabled: Boolean(projectId),
  });
}

export function useAlertConfigQuery(projectId: string) {
  return useQuery<AlertConfig>({
    queryKey: queryKeys.alerts(projectId),
    queryFn: () => deploywatchApi.getAlertConfig(projectId),
    enabled: Boolean(projectId),
  });
}

export function useAuthMutations() {
  const queryClient = useQueryClient();

  const syncSession = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.session }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
    ]);
  };

  return {
    login: useMutation({
      mutationFn: (input: LoginInput) => deploywatchApi.login(input),
      onSuccess: syncSession,
    }),
    signup: useMutation({
      mutationFn: (input: SignupInput) => deploywatchApi.signup(input),
      onSuccess: syncSession,
    }),
    logout: useMutation({
      mutationFn: () => deploywatchApi.logout(),
      onSuccess: async () => {
        await queryClient.clear();
      },
    }),
  };
}

export function useProjectMutations() {
  const queryClient = useQueryClient();

  return {
    createProject: useMutation({
      mutationFn: (input: ProjectInput) => deploywatchApi.createProject(input),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
          queryClient.invalidateQueries({ queryKey: queryKeys.session }),
        ]);
      },
    }),
    setActiveProject: useMutation({
      mutationFn: (projectId: string) => deploywatchApi.setActiveProject(projectId),
      onSuccess: async (_, projectId) => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.session }),
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(projectId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }),
        ]);
      },
    }),
  };
}

export function useApiMutations(projectId: string) {
  const queryClient = useQueryClient();

  const invalidateProjectViews = async (apiId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.apis(projectId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(projectId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents(projectId) }),
      queryClient.invalidateQueries({ queryKey: ["logs", projectId] }),
      apiId ? queryClient.invalidateQueries({ queryKey: queryKeys.apiDetail(projectId, apiId) }) : Promise.resolve(),
    ]);
  };

  return {
    createApi: useMutation({
      mutationFn: (input: ApiInput) => deploywatchApi.createApi(projectId, input),
      onSuccess: async () => invalidateProjectViews(),
    }),
    updateApi: useMutation({
      mutationFn: ({ apiId, input }: { apiId: string; input: ApiInput }) => deploywatchApi.updateApi(projectId, apiId, input),
      onSuccess: async (_, { apiId }) => invalidateProjectViews(apiId),
    }),
    deleteApi: useMutation({
      mutationFn: (apiId: string) => deploywatchApi.deleteApi(projectId, apiId),
      onSuccess: async () => invalidateProjectViews(),
    }),
    toggleApi: useMutation({
      mutationFn: ({ apiId, enabled }: { apiId: string; enabled: boolean }) => deploywatchApi.toggleApi(projectId, apiId, enabled),
      onSuccess: async (_, { apiId }) => invalidateProjectViews(apiId),
    }),
  };
}

export function useAlertMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<AlertConfig, "projectId">) => deploywatchApi.updateAlertConfig(projectId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.alerts(projectId) });
    },
  });
}
