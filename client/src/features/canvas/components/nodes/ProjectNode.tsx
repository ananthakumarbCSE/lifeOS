'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ProjectNodeData } from '@/types/node.types';
import { StatusDot } from '@/components/ui/Badge';

type ProjectNodeProps = NodeProps & { data: ProjectNodeData };

function ProjectNodeComponent({ data, selected }: ProjectNodeProps) {
  return (
    <div
      className={`
        min-w-[240px] max-w-[300px] rounded-[var(--radius-md)]
        bg-[var(--color-bg-surface)] border-2 border-dashed border-[var(--color-node-project)]
        shadow-[var(--shadow-sm)]
        ${selected ? 'shadow-[var(--shadow-md)] ring-1 ring-[var(--color-node-project)]' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--color-node-project)] !w-2.5 !h-2.5" />
      <Handle type="target" position={Position.Left} className="!bg-[var(--color-node-project)] !w-2.5 !h-2.5" />

      <div className="px-3 py-2.5 space-y-1.5">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-node-project)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{data.title}</h3>
          <StatusDot status={data.status} />
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)]">
          {data.goalCount} goal{data.goalCount !== 1 ? 's' : ''} linked
        </p>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--color-node-project)] !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-[var(--color-node-project)] !w-2.5 !h-2.5" />
    </div>
  );
}

export const ProjectNode = memo(ProjectNodeComponent);
