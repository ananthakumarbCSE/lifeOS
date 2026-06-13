import mongoose, { Schema, Document, Types } from 'mongoose';
import { ICanvasPosition } from './Goal.model';

export interface IEvent extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  linkedGoalIds: Types.ObjectId[];
  canvasPosition: ICanvasPosition;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    linkedGoalIds: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
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

eventSchema.index({ userId: 1 });
eventSchema.index({ userId: 1, startDate: 1, endDate: 1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);
