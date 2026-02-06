import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import * as api from '../services/api.ts';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodes: Node[];
  edges: Edge[];
  botToken: string | null;
}

export type AppView = 'projects' | 'token' | 'workspace' | 'tutorial';

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  view: AppView;
  showOnboarding: boolean;
  isLoading: boolean;
  setView: (view: AppView) => void;
  setShowOnboarding: (show: boolean) => void;
  setActiveProject: (id: string | null) => void;
  getActiveProject: () => Project | undefined;
  // API-методы
  fetchProjects: () => Promise<void>;
  addProject: (name: string) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  saveProjectFlow: (id: string, nodes: Node[], edges: Edge[]) => Promise<void>;
  saveBotToken: (id: string, botToken: string | null) => Promise<void>;
}

const ONBOARDING_KEY = 'livebot-onboarding-seen';
const PROJECTS_KEY = 'livebot-projects';
const ACTIVE_PROJECT_KEY = 'livebot-active-project';

// localStorage helpers
function loadProjectsFromStorage(): Project[] {
  try {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveProjectsToStorage(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    // Ignore storage errors
  }
}

function loadActiveProjectFromStorage(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROJECT_KEY);
  } catch {
    return null;
  }
}

function saveActiveProjectToStorage(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_PROJECT_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: loadProjectsFromStorage(),
  activeProjectId: loadActiveProjectFromStorage(),
  view: 'projects',
  showOnboarding: !localStorage.getItem(ONBOARDING_KEY),
  isLoading: false,

  setView: (view) => set({ view }),

  setShowOnboarding: (show) => {
    if (!show) {
      localStorage.setItem(ONBOARDING_KEY, '1');
    }
    set({ showOnboarding: show });
  },

  setActiveProject: (id) => {
    saveActiveProjectToStorage(id);
    set({ activeProjectId: id });
  },

  getActiveProject: () => {
    const { projects, activeProjectId } = get();
    return projects.find((p) => p.id === activeProjectId);
  },

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const apiProjects = await api.fetchProjects();
      const projects: Project[] = apiProjects.map((p) => ({
        id: p.id,
        name: p.name,
        nodes: p.nodes as Node[],
        edges: p.edges as Edge[],
        botToken: p.botToken,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      saveProjectsToStorage(projects);
      set({ projects, isLoading: false });
    } catch {
      // API failed — use localStorage data
      const localProjects = loadProjectsFromStorage();
      set({ projects: localProjects, isLoading: false });
    }
  },

  addProject: async (name) => {
    const projectName = name || 'Новый бот';
    try {
      const apiProject = await api.createProject(projectName);
      const project: Project = {
        id: apiProject.id,
        name: apiProject.name,
        nodes: apiProject.nodes as Node[],
        edges: apiProject.edges as Edge[],
        botToken: apiProject.botToken,
        createdAt: apiProject.createdAt,
        updatedAt: apiProject.updatedAt,
      };
      const newProjects = [...get().projects, project];
      saveProjectsToStorage(newProjects);
      set({ projects: newProjects });
      return project.id;
    } catch {
      // API failed — create project locally
      const project: Project = {
        id: crypto.randomUUID(),
        name: projectName,
        nodes: [],
        edges: [],
        botToken: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const newProjects = [...get().projects, project];
      saveProjectsToStorage(newProjects);
      set({ projects: newProjects });
      return project.id;
    }
  },

  deleteProject: async (id) => {
    try {
      await api.deleteProject(id);
    } catch {
      // API failed — continue with local deletion
    }
    const newProjects = get().projects.filter((p) => p.id !== id);
    const newActiveId = get().activeProjectId === id ? null : get().activeProjectId;
    saveProjectsToStorage(newProjects);
    if (newActiveId !== get().activeProjectId) {
      saveActiveProjectToStorage(newActiveId);
    }
    set({ projects: newProjects, activeProjectId: newActiveId });
  },

  renameProject: async (id, name) => {
    try {
      await api.updateProject(id, { name });
    } catch {
      // API failed — continue with local update
    }
    const newProjects = get().projects.map((p) =>
      p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
    );
    saveProjectsToStorage(newProjects);
    set({ projects: newProjects });
  },

  saveProjectFlow: async (id, nodes, edges) => {
    const newProjects = get().projects.map((p) =>
      p.id === id
        ? { ...p, nodes, edges, updatedAt: new Date().toISOString() }
        : p
    );
    // Always save to localStorage first
    saveProjectsToStorage(newProjects);
    set({ projects: newProjects });

    try {
      await api.updateProject(id, { nodes, edges });
    } catch {
      // API failed — data is already saved to localStorage
    }
  },

  saveBotToken: async (id, botToken) => {
    const newProjects = get().projects.map((p) =>
      p.id === id ? { ...p, botToken } : p
    );
    // Always save to localStorage first
    saveProjectsToStorage(newProjects);
    set({ projects: newProjects });

    try {
      await api.updateProject(id, { botToken });
    } catch {
      // API failed — data is already saved to localStorage
    }
  },
}));
