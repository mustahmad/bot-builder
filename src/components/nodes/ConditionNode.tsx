import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ data }: NodeProps) {
  const conditionType = data.conditionType as string;
  const value = data.value as string;

  const condLabel =
    conditionType === 'text_equals'
      ? 'Текст ='
      : conditionType === 'text_contains'
        ? 'Текст содержит'
        : 'Callback =';

  return (
    <div className="bg-white rounded-lg min-w-[180px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-node-condition)] text-white text-xs font-medium">
        <GitBranch size={13} />
        <span>Условие</span>
      </div>
      <div className="px-3 py-2.5">
        <div className="text-xs text-[var(--color-text-secondary)]">
          {condLabel}
        </div>
        <div className="text-sm font-medium text-[var(--color-text)] mt-0.5 font-mono">
          "{value || '...'}"
        </div>
      </div>
      <div className="flex justify-between px-3 pb-2">
        <span className="text-[10px] font-medium text-emerald-600">Да</span>
        <span className="text-[10px] font-medium text-red-500">Нет</span>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[var(--color-node-condition)]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!bg-emerald-500"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-red-500"
        style={{ left: '70%' }}
      />
    </div>
  );
}
