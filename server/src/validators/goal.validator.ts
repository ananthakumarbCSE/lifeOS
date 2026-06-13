import { z } from 'zod';
import { GOAL_CATEGORIES, PRIORITY_LEVELS, NODE_STATUSES, EISENHOWER_QUADRANTS } from '../models/Goal.model';

export const createGoalSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).default(''),
  category: z.enum(GOAL_CATEGORIES).default('personal'),
  priority: z.enum(PRIORITY_LEVELS).default('medium'),
  deadline: z.string().datetime().nullable().optional(),
  estimatedHours: z.number().min(0).default(0),
  tags: z.array(z.string().max(50)).max(20).default([]),
  canvasPosition: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).optional(),
  category: z.enum(GOAL_CATEGORIES).optional(),
  priority: z.enum(PRIORITY_LEVELS).optional(),
  status: z.enum(NODE_STATUSES).optional(),
  eisenhowerQuadrant: z.enum(EISENHOWER_QUADRANTS).nullable().optional(),
  deadline: z.string().datetime().nullable().optional(),
  estimatedHours: z.number().min(0).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  canvasPosition: z.object({ x: z.number(), y: z.number() }).optional(),
  canvasDimensions: z.object({ width: z.number().min(100), height: z.number().min(50) }).optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(NODE_STATUSES),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
