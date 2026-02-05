import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from '@xyflow/react';

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  removeNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  getSelectedNode: () => Node | undefined;
  duplicateNode: (nodeId: string) => void;
  clearFlow: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        },
        get().edges
      ),
    });
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    });
  },

  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNodeId:
        get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  getSelectedNode: () => {
    const { nodes, selectedNodeId } = get();
    return nodes.find((n) => n.id === selectedNodeId);
  },

  duplicateNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const newNode: Node = {
      ...node,
      id: crypto.randomUUID(),
      position: {
        x: node.position.x + 40,
        y: node.position.y + 40,
      },
      selected: false,
      data: { ...node.data },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  clearFlow: () => set({ nodes: [], edges: [], selectedNodeId: null }),
}));
