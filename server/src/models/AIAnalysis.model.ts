import mongoose, { Schema, Document, Types } from 'mongoose';

export const AI_ANALYSIS_TYPES = ['brain-dump', 'eisenhower', 'conflict-detection', 'youtube-extraction', 'weekly-plan'] as const;
export const VALIDATION_STATUSES = ['pending', 'validated', 'rejected'] as const;

export type AIAnalysisType = typeof AI_ANALYSIS_TYPES[number];
export type ValidationStatus = typeof VALIDATION_STATUSES[number];

export interface ITokenUsage {
  input: number;
  output: number;
}

export interface IAIAnalysis extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: AIAnalysisType;
  inputText: string;
  rawOutput: string;
  parsedOutput: Record<string, unknown>;
  validationStatus: ValidationStatus;
  userApproved: boolean;
  tokenUsage: ITokenUsage;
  createdAt: Date;
}

const aiAnalysisSchema = new Schema<IAIAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: AI_ANALYSIS_TYPES, required: true },
    inputText: { type: String, required: true, maxlength: 10000 },
    rawOutput: { type: String, default: '' },
    parsedOutput: { type: Schema.Types.Mixed, default: {} },
    validationStatus: {
      type: String,
      enum: VALIDATION_STATUSES,
      default: 'pending',
    },
    userApproved: { type: Boolean, default: false },
    tokenUsage: {
      type: new Schema(
        {
          input: { type: Number, default: 0 },
          output: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { transform(_doc, ret) { delete (ret as Record<string, unknown>).__v; return ret; } },
  }
);

aiAnalysisSchema.index({ userId: 1, type: 1 });

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', aiAnalysisSchema);
