import mongoose, { Schema, Document, Types } from 'mongoose';
import { NODE_STATUSES, NodeStatus, ICanvasPosition, ICanvasDimensions } from './Goal.model';

export interface IProject extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description: string;
  status: NodeStatus;
  goalIds: Types.ObjectId[];
  deadline: Date | null;
  canvasPosition: ICanvasPosition;
  canvasDimensions: ICanvasDimensions;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    status: { type: String, enum: NODE_STATUSES, default: 'planned' },
    goalIds: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
    deadline: { type: Date, default: null },
    canvasPosition: {
      type: new Schema({ x: { type: Number, default: 0 }, y: { type: Number, default: 0 } }, { _id: false }),
      default: () => ({}),
    },
    canvasDimensions: {
      type: new Schema({ width: { type: Number, default: 300 }, height: { type: Number, default: 150 } }, { _id: false }),
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { delete (ret as Record<string, unknown>).__v; return ret; } },
  }
);

projectSchema.index({ userId: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
