export type GoalCategory = 'career' | 'academic' | 'personal' | 'project' | 'event' | 'health' | 'finance';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type NodeStatus = 'planned' | 'active' | 'completed' | 'blocked';
export type EisenhowerQuadrant = 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'neither';
export type SourceType = 'manual' | 'brain-dump' | 'youtube';
export type RelationshipType = 'depends-on' | 'blocks' | 'related-to' | 'part-of';

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface GoalNodeData {
  entityId: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: PriorityLevel;
  status: NodeStatus;
  eisenhowerQuadrant: EisenhowerQuadrant | null;
  deadline: string | null;
  estimatedHours: number;
  completionPercentage: number;
  tags: string[];
}

export interface TaskNodeData {
  entityId: string;
  goalId: string;
  title: string;
  description: string;
  status: NodeStatus;
  priority: PriorityLevel;
  estimatedHours: number;
  deadline: string | null;
}

export interface ProjectNodeData {
  entityId: string;
  title: string;
  description: string;
  status: NodeStatus;
  goalCount: number;
  deadline: string | null;
}

export interface EventNodeData {
  entityId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface WarningNodeData {
  entityId: string;
  type: string;
  severity: 'warning' | 'critical';
  description: string;
  suggestion: string;
  involvedNodeIds: string[];
}

export interface EdgeData {
  entityId: string;
  relationshipType: RelationshipType;
  label: string | null;
}

export const CATEGORY_LABELS: Record<GoalCategory, string> = {
  career: 'Career',
  academic: 'Academic',
  personal: 'Personal',
  project: 'Project',
  event: 'Event',
  health: 'Health',
  finance: 'Finance',
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const STATUS_LABELS: Record<NodeStatus, string> = {
  planned: 'Planned',
  active: 'Active',
  completed: 'Completed',
  blocked: 'Blocked',
};

export const QUADRANT_LABELS: Record<EisenhowerQuadrant, string> = {
  'urgent-important': 'Do First',
  'important-not-urgent': 'Schedule',
  'urgent-not-important': 'Delegate',
  'neither': 'Eliminate',
};
