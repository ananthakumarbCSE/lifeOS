import { z } from 'zod';
import { PRIORITY_LEVELS, NODE_STATUSES } from '../models/Goal.model';

export const createTaskSchema = z.object({
  goalId: z.string().min(1, 'Goal ID is required'),
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).default(''),
  priority: z.enum(PRIORITY_LEVELS).default('medium'),
  estimatedHours: z.number().min(0).default(0),
  deadline: z.string().datetime().nullable().optional(),
  order: z.number().int().min(0).default(0),
  canvasPosition: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(NODE_STATUSES).optional(),
  priority: z.enum(PRIORITY_LEVELS).optional(),
  estimatedHours: z.number().min(0).optional(),
  deadline: z.string().datetime().nullable().optional(),
  order: z.number().int().min(0).optional(),
  canvasPosition: z.object({ x: z.number(), y: z.number() }).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
