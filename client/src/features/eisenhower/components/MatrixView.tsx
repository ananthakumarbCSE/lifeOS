'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { QUADRANT_LABELS } from '@/types/node.types';
import type { EisenhowerQuadrant, GoalCategory } from '@/types/node.types';
import { CATEGORY_LABELS } from '@/types/node.types';

interface Goal {
  _id: string;
  title: string;
  category: GoalCategory;
  priority: string;
  status: string;
  eisenhowerQuadrant: EisenhowerQuadrant | null;
  estimatedHours: number;
  deadline: string | null;
}

const quadrantConfig: Record<EisenhowerQuadrant, { title: string; subtitle: string; borderColor: string; bgColor: string }> = {
  'urgent-important': { title: 'Do First', subtitle: 'Urgent & Important', borderColor: 'var(--color-danger)', bgColor: 'var(--color-danger-bg)' },
  'important-not-urgent': { title: 'Schedule', subtitle: 'Important, Not Urgent', borderColor: 'var(--color-accent)', bgColor: 'var(--color-success-bg)' },
  'urgent-not-important': { title: 'Delegate', subtitle: 'Urgent, Not Important', borderColor: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)' },
  'neither': { title: 'Eliminate', subtitle: 'Neither', borderColor: 'var(--color-text-muted)', bgColor: 'transparent' },
};

const quadrants: EisenhowerQuadrant[] = ['urgent-important', 'important-not-urgent', 'urgent-not-important', 'neither'];

export function MatrixView() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [classifying, setClassifying] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      const { data } = await apiClient.get('/goals?limit=100');
      setGoals(data.goals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleClassify() {
    setClassifying(true);
    try {
      const { data } = await apiClient.post('/ai/eisenhower');
      // Apply classifications to local state
      const updated = goals.map((g) => {
        const classification = data.classifications.find((c: { goalId: string }) => c.goalId === g._id);
        if (classification) {
          return { ...g, eisenhowerQuadrant: classification.quadrant as EisenhowerQuadrant };
        }
        return g;
      });
      setGoals(updated);

      // Persist to server
      for (const c of data.classifications) {
        await apiClient.patch(`/goals/${c.goalId}`, { eisenhowerQuadrant: c.quadrant });
      }
    } catch (error) {
      console.error('Failed to classify:', error);
    } finally {
      setClassifying(false);
    }
  }

  async function handleOverride(goalId: string, newQuadrant: EisenhowerQuadrant) {
    setGoals((prev) =>
      prev.map((g) => (g._id === goalId ? { ...g, eisenhowerQuadrant: newQuadrant } : g))
    );
    try {
      await apiClient.patch(`/goals/${goalId}`, { eisenhowerQuadrant: newQuadrant });
    } catch (error) {
      console.error('Failed to update quadrant:', error);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;

  const activeGoals = goals.filter((g) => g.status !== 'completed');

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Eisenhower Matrix</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleClassify} loading={classifying} disabled={activeGoals.length === 0}>
          Classify with AI
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {quadrants.map((q) => {
          const config = quadrantConfig[q];
          const quadrantGoals = activeGoals.filter((g) => g.eisenhowerQuadrant === q);

          return (
            <div
              key={q}
              className="flex flex-col rounded-[var(--radius-lg)] border overflow-hidden"
              style={{ borderColor: config.borderColor, backgroundColor: config.bgColor }}
            >
              <div className="px-4 py-2.5 border-b" style={{ borderColor: config.borderColor }}>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{config.title}</h3>
                <p className="text-[10px] text-[var(--color-text-muted)]">{config.subtitle}</p>
              </div>
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {quadrantGoals.length === 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] text-center py-4">No goals</p>
                )}
                {quadrantGoals.map((goal) => (
                  <div
                    key={goal._id}
                    className="p-2.5 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] space-y-1.5"
                  >
                    <h4 className="text-xs font-medium text-[var(--color-text-primary)]">{goal.title}</h4>
                    <div className="flex items-center gap-1.5">
                      <Badge size="sm">{CATEGORY_LABELS[goal.category]}</Badge>
                      {goal.estimatedHours > 0 && (
                        <span className="text-[10px] text-[var(--color-text-muted)]">{goal.estimatedHours}h</span>
                      )}
                    </div>
                    <select
                      value={q}
                      onChange={(e) => handleOverride(goal._id, e.target.value as EisenhowerQuadrant)}
                      className="w-full text-[10px] px-1.5 py-1 bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] cursor-pointer"
                      aria-label={`Change quadrant for ${goal.title}`}
                    >
                      {quadrants.map((opt) => (
                        <option key={opt} value={opt}>{QUADRANT_LABELS[opt]}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unclassified goals */}
      {activeGoals.filter((g) => !g.eisenhowerQuadrant).length > 0 && (
        <div className="border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Unclassified ({activeGoals.filter((g) => !g.eisenhowerQuadrant).length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeGoals.filter((g) => !g.eisenhowerQuadrant).map((goal) => (
              <span key={goal._id} className="text-xs px-2 py-1 bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] rounded-[var(--radius-sm)]">
                {goal.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
