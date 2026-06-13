import mongoose, { Schema, Document, Types } from 'mongoose';
import { ICanvasPosition } from './Goal.model';

export const CONFLICT_TYPES = ['deadline-overlap', 'workload-excess', 'unrealistic-schedule'] as const;
export const CONFLICT_SEVERITIES = ['warning', 'critical'] as const;

export type ConflictType = typeof CONFLICT_TYPES[number];
export type ConflictSeverity = typeof CONFLICT_SEVERITIES[number];

export interface IConflict extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  involvedNodeIds: Types.ObjectId[];
  involvedNodeTypes: string[];
  suggestion: string;
  resolved: boolean;
  resolvedAt: Date | null;
  canvasPosition: ICanvasPosition;
  createdAt: Date;
}

const conflictSchema = new Schema<IConflict>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: CONFLICT_TYPES, required: true },
    severity: { type: String, enum: CONFLICT_SEVERITIES, default: 'warning' },
    description: { type: String, required: true, maxlength: 500 },
    involvedNodeIds: [{ type: Schema.Types.ObjectId }],
    involvedNodeTypes: [{ type: String }],
    suggestion: { type: String, default: '', maxlength: 500 },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
    canvasPosition: {
      type: new Schema({ x: { type: Number, default: 0 }, y: { type: Number, default: 0 } }, { _id: false }),
      default: () => ({}),
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { transform(_doc, ret) { delete (ret as Record<string, unknown>).__v; return ret; } },
  }
);

conflictSchema.index({ userId: 1, resolved: 1 });

export const Conflict = mongoose.model<IConflict>('Conflict', conflictSchema);
