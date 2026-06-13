'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api-client';
import type { YouTubeExtractionResponse } from '@/types/api.types';

interface YouTubeInputProps {
  isOpen: boolean;
  onClose: () => void;
  onApproved: () => void;
}

type Phase = 'input' | 'extracting' | 'preview' | 'approving';

export function YouTubeInput({ isOpen, onClose, onApproved }: YouTubeInputProps) {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [result, setResult] = useState<YouTubeExtractionResponse | null>(null);
  const [error, setError] = useState('');

  async function handleExtract() {
    setPhase('extracting');
    setError('');
    try {
      const { data } = await apiClient.post('/ai/youtube/extract', { url });
      setResult(data);
      setPhase('preview');
    } catch {
      setError('Failed to extract from video. Check the URL and try again.');
      setPhase('input');
    }
  }

  async function handleApprove() {
    if (!result) return;
    setPhase('approving');
    try {
      await apiClient.post('/ai/youtube/approve', { analysisId: result.analysisId });
      onApproved();
      handleReset();
    } catch {
      setError('Failed to create roadmap.');
      setPhase('preview');
    }
  }

  function handleReset() {
    setUrl('');
    setPhase('input');
    setResult(null);
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="YouTube Action Extractor" maxWidth="40rem">
      {phase === 'input' && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Paste a YouTube URL to extract a learning roadmap from the video content.
          </p>
          <Input
            label="YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={handleExtract} disabled={!url.trim()}>
              Extract Roadmap
            </Button>
          </div>
        </div>
      )}

      {phase === 'extracting' && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">Fetching transcript and extracting roadmap...</p>
          <p className="text-xs text-[var(--color-text-muted)]">This may take 15-30 seconds.</p>
        </div>
      )}

      {phase === 'preview' && result && (
        <div className="space-y-4">
          <div className="p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-md)]">
            <h4 className="text-sm font-medium text-[var(--color-text-primary)]">{result.videoTitle}</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">{result.summary}</p>
          </div>

          <p className="text-sm text-[var(--color-text-secondary)]">
            <strong className="text-[var(--color-text-primary)]">{result.steps.length}</strong> learning steps extracted:
          </p>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {result.steps.map((step) => (
              <div
                key={step.order}
                className="flex items-start gap-3 p-2.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-md)]"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] text-xs font-semibold flex items-center justify-center">
                  {step.order}
                </span>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-[var(--color-text-primary)]">{step.title}</h5>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{step.description}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{step.estimatedHours}h estimated</p>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setPhase('input'); setResult(null); }}>Back</Button>
            <Button onClick={handleApprove}>Create Roadmap</Button>
          </div>
        </div>
      )}

      {phase === 'approving' && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">Creating roadmap nodes...</p>
        </div>
      )}
    </Modal>
  );
}
