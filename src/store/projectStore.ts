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
}

const ONBOARDING_KEY = 'livebot-onboarding-seen';

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: null,
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

  setActiveProject: (id) => set({ activeProjectId: id }),

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
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      set({ projects, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addProject: async (name) => {
    const apiProject = await api.createProject(name || 'Новый бот');
    const project: Project = {
      id: apiProject.id,
      name: apiProject.name,
      nodes: apiProject.nodes as Node[],
      edges: apiProject.edges as Edge[],
      createdAt: apiProject.createdAt,
      updatedAt: apiProject.updatedAt,
    };
    set({ projects: [...get().projects, project] });
    return project.id;
  },

  deleteProject: async (id) => {
    await api.deleteProject(id);
    set({
      projects: get().projects.filter((p) => p.id !== id),
      activeProjectId: get().activeProjectId === id ? null : get().activeProjectId,
    });
  },

  renameProject: async (id, name) => {
    await api.updateProject(id, { name });
    set({
      projects: get().projects.map((p) =>
        p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
      ),
    });
  },

  saveProjectFlow: async (id, nodes, edges) => {
    try {
      await api.updateProject(id, { nodes, edges });
      set({
        projects: get().projects.map((p) =>
          p.id === id
            ? { ...p, nodes, edges, updatedAt: new Date().toISOString() }
            : p
        ),
      });
    } catch {
      // Тихо игнорируем ошибки сохранения
    }
  },
}));
