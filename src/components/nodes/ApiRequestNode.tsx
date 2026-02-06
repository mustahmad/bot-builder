import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Globe } from 'lucide-react';

export function ApiRequestNode({ data }: NodeProps) {
  const method = (data.method as string) || 'GET';
  const url = data.url as string;

  return (
    <div className="bg-white rounded-lg min-w-[180px] max-w-[260px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-node-apiRequest)] text-white text-xs font-medium">
        <Globe size={13} />
        <span>API запрос</span>
      </div>
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-[var(--color-node-apiRequest)]">
            {method}
          </span>
        </div>
        <div className="text-xs text-[var(--color-text-secondary)] font-mono mt-1 truncate">
          {url || 'https://...'}
        </div>
      </div>
      <div className="flex justify-between px-3 pb-2">
        <span className="text-[10px] font-medium text-emerald-600">Успех</span>
        <span className="text-[10px] font-medium text-red-500">Ошибка</span>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[var(--color-node-apiRequest)]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        className="!bg-emerald-500"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="error"
        className="!bg-red-500"
        style={{ left: '70%' }}
      />
    </div>
  );
}
