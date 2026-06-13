import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEisenhowerCorrection {
  goalId: Types.ObjectId;
  originalQuadrant: string;
  correctedQuadrant: string;
  timestamp: Date;
}

export interface IUserPreferences {
  defaultView: 'canvas' | 'matrix' | 'weekly';
  workHoursPerDay: number;
  weekStartDay: number;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  displayName: string;
  preferences: IUserPreferences;
  eisenhowerCorrections: IEisenhowerCorrection[];
  createdAt: Date;
  updatedAt: Date;
}

const eisenhowerCorrectionSchema = new Schema<IEisenhowerCorrection>(
  {
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal', required: true },
    originalQuadrant: { type: String, required: true },
    correctedQuadrant: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userPreferencesSchema = new Schema<IUserPreferences>(
  {
    defaultView: {
      type: String,
      enum: ['canvas', 'matrix', 'weekly'],
      default: 'canvas',
    },
    workHoursPerDay: { type: Number, default: 6, min: 1, max: 16 },
    weekStartDay: { type: Number, default: 1, min: 0, max: 6 },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    passwordHash: { type: String, required: true },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({}),
    },
    eisenhowerCorrections: {
      type: [eisenhowerCorrectionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as Record<string, unknown>;
        delete r.passwordHash;
        delete r.__v;
        return ret;
      },
    },
  }
);


export const User = mongoose.model<IUser>('User', userSchema);
