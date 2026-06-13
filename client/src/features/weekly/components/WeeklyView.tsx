'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { WeeklyPlanResponse, WeeklyDay, WeeklySession } from '@/types/api.types';

const timeSlotColors: Record<string, string> = {
  morning: 'var(--color-warning)',
  afternoon: 'var(--color-accent)',
  evening: 'var(--color-info)',
};

export function WeeklyView() {
  const [plan, setPlan] = useState<WeeklyPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/ai/weekly/generate');
      setPlan(data);
    } catch {
      setError('Failed to generate weekly plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Weekly Plan</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            AI-generated schedule based on your goals and deadlines
          </p>
        </div>
        <Button onClick={handleGenerate} loading={loading}>
          {plan ? 'Regenerate' : 'Generate Plan'}
        </Button>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Spinner size="lg" />
            <p className="text-sm text-[var(--color-text-muted)]">Generating your weekly plan...</p>
          </div>
        </div>
      )}

      {!loading && !plan && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-[var(--color-text-primary)]">No plan generated yet</h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-sm">
              Add some goals first, then generate a realistic weekly schedule.
            </p>
          </div>
        </div>
      )}

      {plan && (
        <>
          {/* Summary */}
          <div className="flex items-center gap-4 p-3 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)]">
            <div className="text-center">
              <p className="text-lg font-semibold text-[var(--color-accent)]">{plan.totalWeekHours}h</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Total</p>
            </div>
            <div className="flex-1 text-xs text-[var(--color-text-secondary)]">{plan.notes}</div>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-3 flex-1 min-h-0">
            {plan.days.map((day: WeeklyDay) => (
              <div
                key={day.dayName}
                className="flex flex-col bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] overflow-hidden"
              >
                <div className="px-2.5 py-2 border-b border-[var(--color-border-default)] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">{day.dayName.substring(0, 3)}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{day.date}</p>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--color-accent)]">{day.totalHours}h</span>
                </div>
                <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
                  {day.sessions.length === 0 && (
                    <p className="text-[10px] text-[var(--color-text-muted)] text-center py-2">Rest day</p>
                  )}
                  {day.sessions.map((session: WeeklySession, i: number) => (
                    <div
                      key={i}
                      className="p-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-elevated)] border-l-2"
                      style={{ borderLeftColor: timeSlotColors[session.timeSlot] }}
                    >
                      <p className="text-[10px] font-medium text-[var(--color-text-primary)] line-clamp-2">
                        {session.taskTitle}
                      </p>
                      <p className="text-[9px] text-[var(--color-text-muted)]">
                        {session.goalTitle} · {session.durationHours}h · {session.timeSlot}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
