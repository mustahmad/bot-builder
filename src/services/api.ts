const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('livebot-token');
}

export function setToken(token: string): void {
  localStorage.setItem('livebot-token', token);
}

export function clearToken(): void {
  localStorage.removeItem('livebot-token');
}

export function hasToken(): boolean {
  return !!localStorage.getItem('livebot-token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Ошибка сервера');
  }

  return data as T;
}

// ---- Auth ----

interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

interface MeResponse {
  user: { id: string; email: string; createdAt: string };
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<MeResponse> {
  return request<MeResponse>('/auth/me');
}

// ---- Projects ----

export interface ApiProject {
  id: string;
  name: string;
  nodes: unknown[];
  edges: unknown[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectsResponse {
  projects: ApiProject[];
}

interface ProjectResponse {
  project: ApiProject;
}

export async function fetchProjects(): Promise<ApiProject[]> {
  const data = await request<ProjectsResponse>('/projects');
  return data.projects;
}

export async function createProject(name: string): Promise<ApiProject> {
  const data = await request<ProjectResponse>('/projects', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return data.project;
}

export async function updateProject(
  id: string,
  updates: { name?: string; nodes?: unknown[]; edges?: unknown[] }
): Promise<ApiProject> {
  const data = await request<ProjectResponse>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.project;
}

export async function deleteProject(id: string): Promise<void> {
  await request<{ ok: boolean }>(`/projects/${id}`, {
    method: 'DELETE',
  });
}
