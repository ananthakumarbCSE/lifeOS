'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { GoalNodeData } from '@/types/node.types';
import { Badge, StatusDot } from '@/components/ui/Badge';
import { PRIORITY_LABELS, CATEGORY_LABELS } from '@/types/node.types';

type GoalNodeProps = NodeProps & { data: GoalNodeData };

const priorityBorderColors: Record<string, string> = {
  critical: 'var(--color-priority-critical)',
  high: 'var(--color-priority-high)',
  medium: 'var(--color-priority-medium)',
  low: 'var(--color-priority-low)',
};

const priorityVariants: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'default',
};

function GoalNodeComponent({ data, selected }: GoalNodeProps) {
  const borderColor = priorityBorderColors[data.priority] || 'var(--color-border-default)';

  return (
    <div
      className={`
        min-w-[220px] max-w-[280px] rounded-[var(--radius-md)]
        bg-[var(--color-bg-surface)] border
        shadow-[var(--shadow-sm)]
        transition-shadow duration-150
        ${selected ? 'shadow-[var(--shadow-md)] ring-1 ring-[var(--color-accent)]' : ''}
      `}
      style={{ borderColor, borderLeftWidth: '3px' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--color-node-goal)] !w-2.5 !h-2.5 !border-[var(--color-bg-surface)]" />

      <div className="px-3 py-2.5 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] leading-tight line-clamp-2">
            {data.title}
          </h3>
          <StatusDot status={data.status} />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={priorityVariants[data.priority]}>
            {PRIORITY_LABELS[data.priority]}
          </Badge>
          <Badge>{CATEGORY_LABELS[data.category]}</Badge>
        </div>

        {/* Progress bar */}
        {data.completionPercentage > 0 && (
          <div className="space-y-1">
            <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
                style={{ width: `${data.completionPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              {data.completionPercentage}% complete
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
          {data.estimatedHours > 0 && (
            <span>{data.estimatedHours}h est.</span>
          )}
          {data.deadline && (
            <span>{new Date(data.deadline).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--color-node-goal)] !w-2.5 !h-2.5 !border-[var(--color-bg-surface)]" />
    </div>
  );
}

export const GoalNode = memo(GoalNodeComponent);
