'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-[var(--color-border-default)]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">LifeOS</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/canvas"
                className="px-4 py-1.5 text-sm font-medium bg-[var(--color-accent)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                Open App
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm font-medium bg-[var(--color-accent)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-medium text-[var(--color-accent)] uppercase tracking-wider">
              AI-Powered Visual Second Brain
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Transform thoughts into
              <br />
              <span className="text-[var(--color-accent)]">structured action plans</span>
            </h1>
            <p className="text-base text-[var(--color-text-secondary)] max-w-lg mx-auto leading-relaxed">
              Capture unstructured goals in natural language. LifeOS extracts objectives,
              builds visual roadmaps, detects conflicts, and generates realistic schedules — all powered by AI.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-2.5 text-sm font-medium bg-[var(--color-accent)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Start Planning
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-3 gap-4 pt-8 text-left">
            <FeatureCard
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0-6 6c0 4 6 9 6 9s6-5 6-9a6 6 0 0 0-6-6z" />
                </svg>
              }
              title="Smart Brain Dump"
              description="Describe goals in natural language. AI extracts structured objectives with tasks and priorities."
            />
            <FeatureCard
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              }
              title="Visual Canvas"
              description="Infinite canvas with draggable nodes, dependency edges, and real-time autosave."
            />
            <FeatureCard
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
              }
              title="Conflict Detection"
              description="Automatically detects overlapping deadlines, workload excess, and unrealistic schedules."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-default)] py-4">
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          LifeOS — Built for focused productivity
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] space-y-2">
      <div className="text-[var(--color-accent)]">{icon}</div>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{title}</h3>
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{description}</p>
    </div>
  );
}
