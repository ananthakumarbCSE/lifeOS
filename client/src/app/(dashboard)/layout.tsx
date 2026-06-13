'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useUIStore } from '@/store/ui.store';
import { BrainDumpInput } from '@/features/brain-dump/components/BrainDumpInput';
import { YouTubeInput } from '@/features/youtube/components/YouTubeInput';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const {
    sidebarOpen,
    activeBrainDump,
    closeBrainDump,
    activeYouTubeExtractor,
    closeYouTubeExtractor,
  } = useUIStore();

  function handleBrainDumpApproved() {
    closeBrainDump();
    // Force page reload to refresh canvas data
    window.location.reload();
  }

  function handleYouTubeApproved() {
    closeYouTubeExtractor();
    window.location.reload();
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />

      <div
        className="flex-1 flex flex-col transition-all duration-200"
        style={{ marginLeft: sidebarOpen ? '14rem' : '4rem' }}
      >
        <TopBar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Global modals */}
      <BrainDumpInput
        isOpen={activeBrainDump}
        onClose={closeBrainDump}
        onApproved={handleBrainDumpApproved}
      />
      <YouTubeInput
        isOpen={activeYouTubeExtractor}
        onClose={closeYouTubeExtractor}
        onApproved={handleYouTubeApproved}
      />
    </div>
  );
}
