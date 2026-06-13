'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { WarningNodeData } from '@/types/node.types';

type WarningNodeProps = NodeProps & { data: WarningNodeData };

function WarningNodeComponent({ data, selected }: WarningNodeProps) {
  const isCritical = data.severity === 'critical';

  return (
    <div
      className={`
        min-w-[220px] max-w-[300px] rounded-[var(--radius-md)]
        bg-[var(--color-bg-surface)]
        border-2 shadow-[var(--shadow-sm)]
        ${isCritical ? 'border-[var(--color-danger)]' : 'border-[var(--color-warning)]'}
        ${selected ? 'shadow-[var(--shadow-md)]' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--color-node-warning)] !w-2.5 !h-2.5" />

      <div className="px-3 py-2.5 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{isCritical ? '🔴' : '⚠️'}</span>
          <span className={`text-xs font-semibold uppercase ${isCritical ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'}`}>
            {data.type.replace(/-/g, ' ')}
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          {data.description}
        </p>
        {data.suggestion && (
          <p className="text-[10px] text-[var(--color-text-muted)] italic">
            💡 {data.suggestion}
          </p>
        )}
      </div>
    </div>
  );
}

export const WarningNode = memo(WarningNodeComponent);
