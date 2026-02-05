import { ReactFlowProvider } from '@xyflow/react';
import { Header } from './Header.tsx';
import { BlockPalette } from './BlockPalette.tsx';
import { FlowEditor } from './FlowEditor.tsx';
import { PropertiesPanel } from './PropertiesPanel.tsx';
import { ChatSimulator } from './ChatSimulator.tsx';
import { useFlowStore } from '../store/flowStore.ts';

export function Workspace() {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Block Palette */}
          <BlockPalette />

          {/* Center: Flow Editor */}
          <FlowEditor />

          {/* Right: Properties + Simulator */}
          <div className="w-[300px] min-w-[300px] bg-white border-l border-[var(--color-border)] flex flex-col">
            {/* Properties (top half or full if no node selected just shows placeholder) */}
            <div
              className={`${selectedNodeId ? 'h-[45%]' : 'h-[140px]'} border-b border-[var(--color-border)] overflow-y-auto transition-all`}
            >
              <PropertiesPanel />
            </div>

            {/* Simulator (bottom) */}
            <div className="flex-1 overflow-hidden">
              <ChatSimulator />
            </div>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
