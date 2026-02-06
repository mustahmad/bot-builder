import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { MessageCircleQuestion } from 'lucide-react';

export function InputWaitNode({ data }: NodeProps) {
  const promptText = data.promptText as string;
  const variableName = data.variableName as string;

  return (
    <div className="bg-white rounded-lg min-w-[180px] max-w-[260px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-node-inputWait)] text-white text-xs font-medium">
        <MessageCircleQuestion size={13} />
        <span>Ожидание ввода</span>
      </div>
      <div className="px-3 py-2.5">
        <div className="text-sm text-[var(--color-text)] leading-snug line-clamp-2">
          {promptText || 'Ожидание ответа...'}
        </div>
        {variableName && (
          <div className="text-[10px] text-[var(--color-text-muted)] mt-1 font-mono">
            &rarr; {variableName}
          </div>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[var(--color-node-inputWait)]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[var(--color-node-inputWait)]"
      />
    </div>
  );
}
