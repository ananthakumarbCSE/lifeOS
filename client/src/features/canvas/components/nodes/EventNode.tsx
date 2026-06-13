'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { EventNodeData } from '@/types/node.types';

type EventNodeProps = NodeProps & { data: EventNodeData };

function EventNodeComponent({ data, selected }: EventNodeProps) {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const dateStr = start.toLocaleDateString() === end.toLocaleDateString()
    ? start.toLocaleDateString()
    : `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;

  return (
    <div
      className={`
        min-w-[200px] max-w-[260px] rounded-[var(--radius-md)]
        bg-[var(--color-bg-surface)] border border-[var(--color-node-event)]
        shadow-[var(--shadow-sm)]
        ${selected ? 'shadow-[var(--shadow-md)] ring-1 ring-[var(--color-node-event)]' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!bg-[var(--color-node-event)] !w-2.5 !h-2.5" />

      <div className="px-3 py-2.5 space-y-1">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-node-event)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{data.title}</h3>
        </div>
        <p className="text-[10px] text-[var(--color-node-event)] font-medium pl-[22px]">
          {dateStr}
        </p>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-[var(--color-node-event)] !w-2.5 !h-2.5" />
    </div>
  );
}

export const EventNode = memo(EventNodeComponent);
