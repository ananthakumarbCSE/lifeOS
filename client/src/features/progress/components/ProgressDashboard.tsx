'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { ProgressData, ConflictData } from '@/types/api.types';
import { CATEGORY_LABELS } from '@/types/node.types';
import type { GoalCategory } from '@/types/node.types';

export function ProgressDashboard() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [progressRes, conflictsRes] = await Promise.all([
        apiClient.get('/progress'),
        apiClient.get('/progress/conflicts'),
      ]);
      setProgress(progressRes.data);
      setConflicts(conflictsRes.data.conflicts);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDetectConflicts() {
    setDetecting(true);
    try {
      const { data } = await apiClient.post('/ai/conflicts/detect');
      setConflicts(data.conflicts.map((c: ConflictData, i: number) => ({ ...c, _id: `temp-${i}` })));
      await loadData();
    } catch (error) {
      console.error('Failed to detect conflicts:', error);
    } finally {
      setDetecting(false);
    }
  }

  async function handleResolveConflict(id: string) {
    try {
      await apiClient.patch(`/progress/conflicts/${id}/resolve`);
      setConflicts((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;
  if (!progress) return null;

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-auto">
      <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Progress</h1>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Goals" value={progress.goals.total} sub={`${progress.goals.completed} completed`} color="var(--color-accent)" />
        <StatCard label="Tasks" value={progress.tasks.total} sub={`${progress.tasks.completionRate}% done`} color="var(--color-node-task)" />
        <StatCard label="Projects" value={progress.projects.total} sub={`${progress.projects.active} active`} color="var(--color-node-project)" />
        <StatCard label="Avg Completion" value={`${progress.goals.averageCompletion}%`} sub="across all goals" color="var(--color-success)" />
      </div>

      {/* Goal status breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)]">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Goal Status</h3>
          <div className="space-y-2">
            {(['planned', 'active', 'completed', 'blocked'] as const).map((status) => {
              const count = progress.goals[status];
              const pct = progress.goals.total > 0 ? (count / progress.goals.total) * 100 : 0;
              const colors: Record<string, string> = { planned: 'var(--color-text-muted)', active: 'var(--color-info)', completed: 'var(--color-success)', blocked: 'var(--color-danger)' };
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-[var(--color-text-secondary)] capitalize">{status}</span>
                  <div className="flex-1 h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colors[status] }} />
                  </div>
                  <span className="w-8 text-xs text-[var(--color-text-muted)] text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)]">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">By Category</h3>
          <div className="space-y-2">
            {Object.entries(progress.categoryBreakdown).map(([cat, data]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">{CATEGORY_LABELS[cat as GoalCategory] || cat}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{data.completed}/{data.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conflicts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
            Conflicts {conflicts.length > 0 && <span className="text-[var(--color-danger)]">({conflicts.length})</span>}
          </h3>
          <Button variant="secondary" size="sm" onClick={handleDetectConflicts} loading={detecting}>
            Detect Conflicts
          </Button>
        </div>

        {conflicts.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">No active conflicts detected.</p>
        )}

        {conflicts.map((conflict) => (
          <div
            key={conflict._id}
            className={`p-3 border rounded-[var(--radius-md)] space-y-2 ${
              conflict.severity === 'critical'
                ? 'border-[var(--color-danger)] bg-[var(--color-danger-bg)]'
                : 'border-[var(--color-warning)] bg-[var(--color-warning-bg)]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-[var(--color-text-primary)] uppercase">
                  {conflict.severity === 'critical' ? '🔴' : '⚠️'} {conflict.type.replace(/-/g, ' ')}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{conflict.description}</p>
                {conflict.suggestion && (
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1 italic">💡 {conflict.suggestion}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleResolveConflict(conflict._id)}>
                Resolve
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Recent Activity</h3>
        <div className="space-y-1">
          {progress.recentActivity.slice(0, 10).map((activity, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 text-xs text-[var(--color-text-muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] flex-shrink-0" />
              <span className="capitalize">{activity.action}</span>
              <span className="text-[var(--color-text-secondary)]">{activity.entityType}</span>
              <span className="ml-auto text-[10px]">{new Date(activity.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)]">
      <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      <p className="text-2xl font-semibold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{sub}</p>
    </div>
  );
}
