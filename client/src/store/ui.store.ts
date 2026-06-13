import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeBrainDump: boolean;
  activeYouTubeExtractor: boolean;
  activeNodeEditor: string | null; // node ID being edited

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openBrainDump: () => void;
  closeBrainDump: () => void;
  openYouTubeExtractor: () => void;
  closeYouTubeExtractor: () => void;
  setActiveNodeEditor: (nodeId: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeBrainDump: false,
  activeYouTubeExtractor: false,
  activeNodeEditor: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openBrainDump: () => set({ activeBrainDump: true }),
  closeBrainDump: () => set({ activeBrainDump: false }),
  openYouTubeExtractor: () => set({ activeYouTubeExtractor: true }),
  closeYouTubeExtractor: () => set({ activeYouTubeExtractor: false }),
  setActiveNodeEditor: (nodeId) => set({ activeNodeEditor: nodeId }),
}));
