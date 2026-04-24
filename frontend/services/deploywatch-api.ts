import { clearSessionCookie, readSessionStorage, setSessionCookie, writeSessionStorage } from "@/services/session";
import type {
  AlertConfig,
  ApiDetail,
  ApiInput,
  LogsFilter,
  LoginInput,
  Project,
  ProjectDashboard,
  ProjectInput,
  ProjectWithAlertConfig,
  Session,
  SignupInput,
} from "@/types";
import { apiFetch } from "./api-client";

export const deploywatchApi = {
  async getSession(): Promise<Session | null> {
    const session = readSessionStorage();
    if (!session) return null;
    
    try {
      const { user } = await apiFetch<{ user: any }>("/auth/me");
      return {
        ...session,
        name: user.name,
        email: user.email,
      };
    } catch (error) {
      this.logout();
      return null;
    }
  },

  async signup(input: SignupInput): Promise<Session> {
    const { token, user, project } = await apiFetch<{ token: string; user: any; project?: any }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
    });

    const session: Session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      token,
      activeProjectId: project?.id,
    };

    writeSessionStorage(session);
    setSessionCookie();
    return session;
  },

  async login(input: LoginInput): Promise<Session> {
    const { token, user, projects } = await apiFetch<{ token: string; user: any; projects: any[] }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });

    const session: Session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      token,
      activeProjectId: projects[0]?.id,
    };

    writeSessionStorage(session);
    setSessionCookie();
    return session;
  },

  async logout() {
    writeSessionStorage(null);
    clearSessionCookie();
    return true;
  },

  async getProjects(): Promise<ProjectWithAlertConfig[]> {
    const projects = await apiFetch<any[]>("/projects");
    return projects.map((p) => ({
      ...p,
      ownerUserId: p.ownerId, // Map backend ownerId to frontend ownerUserId
      alertConfig: p.alertPolicy || {
        latencyThresholdMs: 800,
        failureCountThreshold: 3,
        emailEnabled: false,
        emailRecipients: [],
      },
    }));
  },

  async createProject(input: ProjectInput): Promise<Project> {
    const project = await apiFetch<any>("/projects", {
      method: "POST",
      body: JSON.stringify(input),
    });
    
    // Update active project in session
    const session = readSessionStorage();
    if (session) {
      writeSessionStorage({ ...session, activeProjectId: project.id });
    }

    return {
      ...project,
      ownerUserId: project.ownerId,
    };
  },

  async setActiveProject(projectId: string): Promise<Session> {
    const session = readSessionStorage();
    if (!session) throw new Error("No session");
    
    const nextSession = { ...session, activeProjectId: projectId };
    writeSessionStorage(nextSession);
    return nextSession;
  },

  async getProjectDashboard(projectId: string): Promise<ProjectDashboard> {
    const data = await apiFetch<any>(`/projects/${projectId}/dashboard`);
    return {
      project: {
        ...data.project,
        ownerUserId: data.project.ownerId,
      },
      overview: data.overview,
      apis: data.apis.map((api: any) => ({
        ...api,
        health: api.health,
      })),
    };
  },

  async getProject(projectId: string): Promise<ProjectWithAlertConfig> {
    const project = await apiFetch<any>(`/projects/${projectId}`);
    return {
      ...project,
      ownerUserId: project.ownerId,
      alertConfig: project.alertPolicy,
    };
  },

  async getApis(projectId: string) {
    const apis = await apiFetch<any[]>(`/projects/${projectId}/apis`);
    return apis.map((api) => ({
      ...api,
      health: api.health,
    }));
  },

  async createApi(projectId: string, input: ApiInput): Promise<MonitoredApi> {
    return apiFetch(`/projects/${projectId}/apis`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateApi(projectId: string, apiId: string, input: ApiInput): Promise<MonitoredApi> {
    return apiFetch(`/projects/${projectId}/apis/${apiId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async deleteApi(projectId: string, apiId: string): Promise<boolean> {
    await apiFetch(`/projects/${projectId}/apis/${apiId}`, {
      method: "DELETE",
    });
    return true;
  },

  async toggleApi(projectId: string, apiId: string, enabled: boolean): Promise<MonitoredApi> {
    return apiFetch(`/projects/${projectId}/apis/${apiId}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    });
  },

  async getApiDetail(projectId: string, apiId: string): Promise<ApiDetail> {
    return apiFetch(`/projects/${projectId}/apis/${apiId}`);
  },

  async getIncidents(projectId: string): Promise<Incident[]> {
    return apiFetch(`/projects/${projectId}/incidents`);
  },

  async getIncident(projectId: string, incidentId: string): Promise<Incident> {
    return apiFetch(`/projects/${projectId}/incidents/${incidentId}`);
  },

  async getLogs(projectId: string, filter: LogsFilter): Promise<any[]> {
    const query = new URLSearchParams({
      range: filter.range,
      outcome: filter.outcome,
    });
    return apiFetch(`/projects/${projectId}/logs?${query}`);
  },

  async getAlertConfig(projectId: string): Promise<AlertConfig> {
    return apiFetch(`/projects/${projectId}/alerts`);
  },

  async updateAlertConfig(projectId: string, input: Omit<AlertConfig, "projectId">): Promise<AlertConfig> {
    return apiFetch(`/projects/${projectId}/alerts`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};
