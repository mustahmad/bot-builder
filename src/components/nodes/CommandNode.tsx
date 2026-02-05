import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Terminal } from 'lucide-react';

export function CommandNode({ data }: NodeProps) {
  const command = data.command as string;
  const description = data.description as string;

  return (
    <div className="bg-white rounded-lg min-w-[180px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-node-command)] text-white text-xs font-medium">
        <Terminal size={13} />
        <span>Команда</span>
      </div>
      <div className="px-3 py-2.5">
        <div className="font-mono text-sm font-semibold text-[var(--color-node-command)]">
          {command || '/command'}
        </div>
        {description && (
          <div className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-tight">
            {description}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[var(--color-node-command)]"
      />
    </div>
  );
}
