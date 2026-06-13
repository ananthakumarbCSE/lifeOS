import mongoose, { Schema, Document, Types } from 'mongoose';

export const ACTIVITY_ACTIONS = ['created', 'updated', 'completed', 'deleted', 'status-changed'] as const;
export const ENTITY_TYPES = ['goal', 'task', 'project', 'event'] as const;

export type ActivityAction = typeof ACTIVITY_ACTIONS[number];
export type EntityType = typeof ENTITY_TYPES[number];

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  action: ActivityAction;
  entityType: EntityType;
  entityId: Types.ObjectId;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ACTIVITY_ACTIONS, required: true },
    entityType: { type: String, enum: ENTITY_TYPES, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { transform(_doc, ret) { delete (ret as Record<string, unknown>).__v; return ret; } },
  }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
