export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface BrainDumpObjective {
  title: string;
  description: string;
  category: string;
  priority: string;
  estimatedHours: number;
  deadline: string;
  suggestedTasks: Array<{
    title: string;
    estimatedHours: number;
    order: number;
  }>;
}

export interface BrainDumpResponse {
  analysisId: string;
  objectives: BrainDumpObjective[];
}

export interface EisenhowerClassification {
  goalId: string;
  quadrant: string;
  reasoning: string;
}

export interface EisenhowerResponse {
  analysisId: string;
  classifications: EisenhowerClassification[];
}

export interface ConflictData {
  _id: string;
  type: string;
  severity: 'warning' | 'critical';
  description: string;
  involvedNodeIds: string[];
  suggestion: string;
  resolved: boolean;
}

export interface WeeklySession {
  goalId: string;
  goalTitle: string;
  taskTitle: string;
  durationHours: number;
  timeSlot: 'morning' | 'afternoon' | 'evening';
}

export interface WeeklyDay {
  dayName: string;
  date: string;
  sessions: WeeklySession[];
  totalHours: number;
}

export interface WeeklyPlanResponse {
  analysisId: string;
  weekStart: string;
  days: WeeklyDay[];
  totalWeekHours: number;
  notes: string;
}

export interface ProgressData {
  goals: {
    total: number;
    planned: number;
    active: number;
    completed: number;
    blocked: number;
    averageCompletion: number;
  };
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  categoryBreakdown: Record<string, { total: number; completed: number }>;
  recentActivity: Array<{
    action: string;
    entityType: string;
    metadata: Record<string, unknown>;
    createdAt: string;
  }>;
}

export interface YouTubeExtractionResponse {
  analysisId: string;
  videoTitle: string;
  summary: string;
  steps: Array<{
    order: number;
    title: string;
    description: string;
    estimatedHours: number;
  }>;
}
