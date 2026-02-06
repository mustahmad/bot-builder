import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from '@xyflow/react';
import type { ReactFlowInstance } from '@xyflow/react';
import { useFlowStore } from '../store/flowStore.ts';
import { nodeTypes } from './nodes/index.ts';
import { DeletableEdge } from './edges/DeletableEdge.tsx';

const edgeTypes = {
  deletable: DeletableEdge,
};

export function FlowEditor() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const addNode = useFlowStore((s) => s.addNode);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);

  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow-type');
      const dataStr = e.dataTransfer.getData('application/reactflow-data');

      if (!type || !reactFlowRef.current) return;

      const position = reactFlowRef.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const data = dataStr ? JSON.parse(dataStr) : {};

      const newNode = {
        id: crypto.randomUUID(),
        type,
        position,
        data,
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onEdgeClick = useCallback(
    () => {
      setSelectedNode(null);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => {
          reactFlowRef.current = instance;
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: 'deletable',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-[var(--color-surface-alt)]"
      >
        <Controls position="bottom-left" />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#cbd5e1"
        />
        <MiniMap
          position="bottom-right"
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              command: 'var(--color-node-command)',
              message: 'var(--color-node-message)',
              buttons: 'var(--color-node-buttons)',
              condition: 'var(--color-node-condition)',
              broadcast: 'var(--color-node-broadcast)',
              image: 'var(--color-node-image)',
              delay: 'var(--color-node-delay)',
              apiRequest: 'var(--color-node-apiRequest)',
              inputWait: 'var(--color-node-inputWait)',
            };
            return colors[node.type || ''] || '#94a3b8';
          }}
          maskColor="rgba(248, 250, 252, 0.7)"
          style={{ border: '1px solid var(--color-border)' }}
        />
      </ReactFlow>
    </div>
  );
}
