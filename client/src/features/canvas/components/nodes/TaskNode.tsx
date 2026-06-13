'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { TaskNodeData } from '@/types/node.types';
import { StatusDot } from '@/components/ui/Badge';

type TaskNodeProps = NodeProps & { data: TaskNodeData };

function TaskNodeComponent({ data, selected }: TaskNodeProps) {
  return (
    <div
      className={`
        min-w-[180px] max-w-[240px] rounded-[var(--radius-md)]
        bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]
        shadow-[var(--shadow-sm)]
        ${selected ? 'shadow-[var(--shadow-md)] ring-1 ring-[var(--color-node-task)]' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--color-node-task)] !w-2 !h-2 !border-[var(--color-bg-surface)]" />

      <div className="px-3 py-2 space-y-1">
        <div className="flex items-center gap-2">
          <StatusDot status={data.status} />
          <h4 className="text-xs font-medium text-[var(--color-text-primary)] leading-tight line-clamp-2">
            {data.title}
          </h4>
        </div>
        {data.estimatedHours > 0 && (
          <p className="text-[10px] text-[var(--color-text-muted)] pl-4">
            {data.estimatedHours}h
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--color-node-task)] !w-2 !h-2 !border-[var(--color-bg-surface)]" />
    </div>
  );
}

export const TaskNode = memo(TaskNodeComponent);
