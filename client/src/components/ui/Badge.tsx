'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info)]',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium border rounded-[var(--radius-sm)]
        ${size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
        ${variantStyles[variant]}
      `}
    >
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    planned: 'bg-[var(--color-text-muted)]',
    active: 'bg-[var(--color-info)]',
    completed: 'bg-[var(--color-success)]',
    blocked: 'bg-[var(--color-danger)]',
  };

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colorMap[status] || colorMap.planned}`}
      aria-label={`Status: ${status}`}
    />
  );
}
