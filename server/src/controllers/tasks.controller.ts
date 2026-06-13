import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task.model';
import { Goal } from '../models/Goal.model';
import { ActivityLog } from '../models/ActivityLog.model';
import { sanitizeString } from '../utils/sanitize';

export async function listTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { goalId, status } = req.query;

    const filter: Record<string, unknown> = { userId };
    if (goalId && typeof goalId === 'string') filter.goalId = goalId;
    if (status && typeof status === 'string') filter.status = status;

    const tasks = await Task.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    // Verify goal ownership
    const goal = await Goal.findOne({ _id: req.body.goalId, userId });
    if (!goal) {
      res.status(404).json({ error: 'Parent goal not found' });
      return;
    }

    const data = {
      ...req.body,
      userId,
      title: sanitizeString(req.body.title),
      description: sanitizeString(req.body.description || ''),
    };

    const task = await Task.create(data);

    await ActivityLog.create({
      userId,
      action: 'created',
      entityType: 'task',
      entityId: task._id,
      metadata: { title: task.title, goalId: goal._id },
    });

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const updates = { ...req.body };

    if (updates.title) updates.title = sanitizeString(updates.title);
    if (updates.description) updates.description = sanitizeString(updates.description);

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // If task completed, recalculate parent goal completion
    if (updates.status) {
      await recalculateGoalCompletion(task.goalId.toString(), userId);
    }

    await ActivityLog.create({
      userId,
      action: updates.status ? 'status-changed' : 'updated',
      entityType: 'task',
      entityId: task._id,
      metadata: { fields: Object.keys(updates) },
    });

    res.json({ task });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Recalculate parent goal
    await recalculateGoalCompletion(task.goalId.toString(), userId);

    await ActivityLog.create({
      userId,
      action: 'deleted',
      entityType: 'task',
      entityId: task._id,
      metadata: { title: task.title },
    });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
}

async function recalculateGoalCompletion(goalId: string, userId: string): Promise<void> {
  const tasks = await Task.find({ goalId, userId }).lean();
  if (tasks.length === 0) return;

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const percentage = Math.round((completed / tasks.length) * 100);

  await Goal.findByIdAndUpdate(goalId, {
    $set: { completionPercentage: percentage },
  });
}
