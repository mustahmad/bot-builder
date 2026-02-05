import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { LayoutGrid } from 'lucide-react';
import type { ButtonItem } from '../../types/index.ts';

export function ButtonsNode({ data }: NodeProps) {
  const buttons = (data.buttons as ButtonItem[]) || [];

  return (
    <div className="bg-white rounded-lg min-w-[180px] max-w-[260px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-node-buttons)] text-white text-xs font-medium">
        <LayoutGrid size={13} />
        <span>Кнопки</span>
      </div>
      <div className="px-3 py-2.5">
        {buttons.length > 0 ? (
          <div className="flex flex-col gap-1">
            {buttons.slice(0, 4).map((btn) => (
              <div
                key={btn.id}
                className="text-xs px-2 py-1 rounded bg-[var(--color-node-buttons)]/10 text-[var(--color-node-buttons)] font-medium text-center truncate"
              >
                {btn.text || 'Кнопка'}
              </div>
            ))}
            {buttons.length > 4 && (
              <div className="text-[10px] text-[var(--color-text-muted)] text-center">
                +{buttons.length - 4} ещё
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-[var(--color-text-muted)]">
            Нет кнопок
          </div>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[var(--color-node-buttons)]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[var(--color-node-buttons)]"
      />
    </div>
  );
}
