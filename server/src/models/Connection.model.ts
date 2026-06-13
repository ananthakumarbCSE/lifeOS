import mongoose, { Schema, Document, Types } from 'mongoose';

export const NODE_TYPES = ['goal', 'task', 'project', 'event', 'milestone'] as const;
export const RELATIONSHIP_TYPES = ['depends-on', 'blocks', 'related-to', 'part-of'] as const;

export type NodeType = typeof NODE_TYPES[number];
export type RelationshipType = typeof RELATIONSHIP_TYPES[number];

export interface IConnection extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  sourceId: Types.ObjectId;
  sourceType: NodeType;
  targetId: Types.ObjectId;
  targetType: NodeType;
  relationshipType: RelationshipType;
  label: string | null;
  createdAt: Date;
}

const connectionSchema = new Schema<IConnection>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sourceId: { type: Schema.Types.ObjectId, required: true },
    sourceType: { type: String, enum: NODE_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: NODE_TYPES, required: true },
    relationshipType: {
      type: String,
      enum: RELATIONSHIP_TYPES,
      default: 'related-to',
    },
    label: { type: String, default: null, maxlength: 100 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { transform(_doc, ret) { delete (ret as Record<string, unknown>).__v; return ret; } },
  }
);

connectionSchema.index({ userId: 1 });
connectionSchema.index({ sourceId: 1 });
connectionSchema.index({ targetId: 1 });

export const Connection = mongoose.model<IConnection>('Connection', connectionSchema);
