import mongoose, { Schema, Document, Types } from 'mongoose';
import { PRIORITY_LEVELS, NODE_STATUSES, PriorityLevel, NodeStatus, ICanvasPosition } from './Goal.model';

export interface ITask extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  goalId: Types.ObjectId;
  title: string;
  description: string;
  status: NodeStatus;
  priority: PriorityLevel;
  estimatedHours: number;
  deadline: Date | null;
  order: number;
  canvasPosition: ICanvasPosition;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    status: { type: String, enum: NODE_STATUSES, default: 'planned' },
    priority: { type: String, enum: PRIORITY_LEVELS, default: 'medium' },
    estimatedHours: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, default: null },
    order: { type: Number, default: 0 },
    canvasPosition: {
      type: new Schema({ x: { type: Number, default: 0 }, y: { type: Number, default: 0 } }, { _id: false }),
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { delete (ret as Record<string, unknown>).__v; return ret; } },
  }
);

taskSchema.index({ userId: 1 });
taskSchema.index({ goalId: 1 });
taskSchema.index({ userId: 1, status: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
