import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoadmapStep {
  order: number;
  title: string;
  description: string;
  estimatedHours: number;
  nodeId: Types.ObjectId | null;
}

export interface IRoadmap extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  youtubeUrl: string;
  videoTitle: string;
  steps: IRoadmapStep[];
  aiAnalysisId: Types.ObjectId;
  createdAt: Date;
}

const roadmapStepSchema = new Schema<IRoadmapStep>(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 1000 },
    estimatedHours: { type: Number, default: 1, min: 0 },
    nodeId: { type: Schema.Types.ObjectId, ref: 'Goal', default: null },
  },
  { _id: false }
);

const roadmapSchema = new Schema<IRoadmap>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    youtubeUrl: { type: String, required: true },
    videoTitle: { type: String, required: true, maxlength: 300 },
    steps: { type: [roadmapStepSchema], default: [] },
    aiAnalysisId: { type: Schema.Types.ObjectId, ref: 'AIAnalysis', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { transform(_doc, ret) { delete (ret as Record<string, unknown>).__v; return ret; } },
  }
);

roadmapSchema.index({ userId: 1 });

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', roadmapSchema);
