import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';

export function DelayNode({ data }: NodeProps) {
  const delaySeconds = data.delaySeconds as number;
  const showTyping = data.showTyping as boolean;

  const formatDelay = (seconds: number): string => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins} мин ${secs} сек` : `${mins} мин`;
    }
    return `${seconds} сек`;
  };

  return (
    <div className="bg-white rounded-lg min-w-[180px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-node-delay)] text-white text-xs font-medium">
        <Clock size={13} />
        <span>Задержка</span>
      </div>
      <div className="px-3 py-2.5">
        <div className="text-sm font-medium text-[var(--color-text)]">
          {delaySeconds ? formatDelay(delaySeconds) : 'Не задано'}
        </div>
        {showTyping && (
          <div className="text-[10px] text-[var(--color-text-muted)] mt-1">
            печатает...
          </div>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[var(--color-node-delay)]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[var(--color-node-delay)]"
      />
    </div>
  );
}
