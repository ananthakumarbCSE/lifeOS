import mongoose, { Schema, Document, Types } from 'mongoose';

export const GOAL_CATEGORIES = ['career', 'academic', 'personal', 'project', 'event', 'health', 'finance'] as const;
export const PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low'] as const;
export const NODE_STATUSES = ['planned', 'active', 'completed', 'blocked'] as const;
export const EISENHOWER_QUADRANTS = ['urgent-important', 'important-not-urgent', 'urgent-not-important', 'neither'] as const;
export const SOURCE_TYPES = ['manual', 'brain-dump', 'youtube'] as const;

export type GoalCategory = typeof GOAL_CATEGORIES[number];
export type PriorityLevel = typeof PRIORITY_LEVELS[number];
export type NodeStatus = typeof NODE_STATUSES[number];
export type EisenhowerQuadrant = typeof EISENHOWER_QUADRANTS[number];
export type SourceType = typeof SOURCE_TYPES[number];

export interface ICanvasPosition {
  x: number;
  y: number;
}

export interface ICanvasDimensions {
  width: number;
  height: number;
}

export interface IGoal extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description: string;
  category: GoalCategory;
  priority: PriorityLevel;
  status: NodeStatus;
  eisenhowerQuadrant: EisenhowerQuadrant | null;
  deadline: Date | null;
  estimatedHours: number;
  tags: string[];
  canvasPosition: ICanvasPosition;
  canvasDimensions: ICanvasDimensions;
  sourceType: SourceType;
  sourceId: string | null;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const canvasPositionSchema = new Schema<ICanvasPosition>(
  {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  { _id: false }
);

const canvasDimensionsSchema = new Schema<ICanvasDimensions>(
  {
    width: { type: Number, default: 250 },
    height: { type: Number, default: 120 },
  },
  { _id: false }
);

const goalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    category: {
      type: String,
      enum: GOAL_CATEGORIES,
      default: 'personal',
    },
    priority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: 'medium',
    },
    status: {
      type: String,
      enum: NODE_STATUSES,
      default: 'planned',
    },
    eisenhowerQuadrant: {
      type: String,
      enum: [...EISENHOWER_QUADRANTS, null],
      default: null,
    },
    deadline: { type: Date, default: null },
    estimatedHours: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    canvasPosition: { type: canvasPositionSchema, default: () => ({}) },
    canvasDimensions: { type: canvasDimensionsSchema, default: () => ({}) },
    sourceType: {
      type: String,
      enum: SOURCE_TYPES,
      default: 'manual',
    },
    sourceId: { type: String, default: null },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform(_doc, ret) { delete (ret as Record<string, unknown>).__v; return ret; } },
  }
);

goalSchema.index({ userId: 1 });
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
