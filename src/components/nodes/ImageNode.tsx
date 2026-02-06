import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { ImageIcon } from 'lucide-react';

export function ImageNode({ data }: NodeProps) {
  const imageUrl = data.imageUrl as string;
  const caption = data.caption as string;

  return (
    <div className="bg-white rounded-lg min-w-[180px] max-w-[260px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-node-image)] text-white text-xs font-medium">
        <ImageIcon size={13} />
        <span>Изображение</span>
      </div>
      <div className="px-3 py-2.5">
        {imageUrl ? (
          <div className="text-xs text-[var(--color-text-secondary)] font-mono truncate">
            {imageUrl}
          </div>
        ) : (
          <div className="text-xs text-[var(--color-text-muted)]">
            Укажите URL изображения...
          </div>
        )}
        {caption && (
          <div className="text-[11px] text-[var(--color-text)] mt-1 leading-tight line-clamp-2">
            {caption}
          </div>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[var(--color-node-image)]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[var(--color-node-image)]"
      />
    </div>
  );
}
