import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

export function MessageNode({ data }: NodeProps) {
  const text = data.text as string;

  return (
    <div className="bg-white rounded-lg min-w-[180px] max-w-[260px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-node-message)] text-white text-xs font-medium">
        <MessageSquare size={13} />
        <span>Сообщение</span>
      </div>
      <div className="px-3 py-2.5">
        <div className="text-sm text-[var(--color-text)] leading-snug line-clamp-3">
          {text || 'Введите текст сообщения...'}
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[var(--color-node-message)]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[var(--color-node-message)]"
      />
    </div>
  );
}
