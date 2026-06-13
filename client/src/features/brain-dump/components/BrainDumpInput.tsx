'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import type { BrainDumpResponse, BrainDumpObjective } from '@/types/api.types';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@/types/node.types';
import type { GoalCategory, PriorityLevel } from '@/types/node.types';

interface BrainDumpInputProps {
  isOpen: boolean;
  onClose: () => void;
  onApproved: () => void;
}

type Phase = 'input' | 'loading' | 'preview' | 'approving';

export function BrainDumpInput({ isOpen, onClose, onApproved }: BrainDumpInputProps) {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [result, setResult] = useState<BrainDumpResponse | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    if (text.trim().length < 10) {
      setError('Please provide at least 10 characters.');
      return;
    }

    setPhase('loading');
    setError('');

    try {
      const { data } = await apiClient.post('/ai/brain-dump', { text });
      setResult(data);
      setPhase('preview');
    } catch (err) {
      setError('Failed to analyze input. Please try again.');
      setPhase('input');
    }
  }

  async function handleApprove() {
    if (!result) return;

    setPhase('approving');
    try {
      await apiClient.post('/ai/brain-dump/approve', { analysisId: result.analysisId });
      onApproved();
      handleReset();
    } catch {
      setError('Failed to create goals. Please try again.');
      setPhase('preview');
    }
  }

  function handleReset() {
    setText('');
    setPhase('input');
    setResult(null);
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Brain Dump" maxWidth="40rem">
      {phase === 'input' && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Describe your goals, tasks, and plans in natural language. The AI will extract structured objectives.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., I need to finish DSA preparation, complete my ML project, participate in a hackathon, and prepare for placements..."
            className="w-full h-40 px-3 py-2.5 text-sm bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
            aria-label="Brain dump text input"
          />
          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={handleAnalyze} disabled={text.trim().length < 10}>
              Analyze with AI
            </Button>
          </div>
        </div>
      )}

      {phase === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">Analyzing your input...</p>
        </div>
      )}

      {phase === 'preview' && result && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Found <strong className="text-[var(--color-text-primary)]">{result.objectives.length}</strong> objectives. Review before creating nodes:
          </p>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {result.objectives.map((obj: BrainDumpObjective, i: number) => (
              <div
                key={i}
                className="p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-[var(--color-text-primary)]">{obj.title}</h4>
                  <Badge variant={obj.priority === 'critical' ? 'danger' : obj.priority === 'high' ? 'warning' : 'info'}>
                    {PRIORITY_LABELS[obj.priority as PriorityLevel]}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">{obj.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                  <Badge>{CATEGORY_LABELS[obj.category as GoalCategory]}</Badge>
                  <span>{obj.estimatedHours}h estimated</span>
                  {obj.deadline && <span>Due: {obj.deadline}</span>}
                </div>
                {obj.suggestedTasks.length > 0 && (
                  <div className="pl-3 border-l-2 border-[var(--color-border-muted)] space-y-1">
                    {obj.suggestedTasks.map((task, j) => (
                      <p key={j} className="text-[11px] text-[var(--color-text-muted)]">
                        {task.order}. {task.title} <span className="text-[var(--color-text-muted)]">({task.estimatedHours}h)</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setPhase('input'); setResult(null); }}>
              Edit Input
            </Button>
            <Button onClick={handleApprove}>
              Create {result.objectives.length} Goals
            </Button>
          </div>
        </div>
      )}

      {phase === 'approving' && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">Creating goals and tasks...</p>
        </div>
      )}
    </Modal>
  );
}
