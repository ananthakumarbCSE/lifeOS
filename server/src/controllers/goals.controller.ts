import { Request, Response, NextFunction } from 'express';
import { Goal } from '../models/Goal.model';
import { ActivityLog } from '../models/ActivityLog.model';
import { sanitizeString } from '../utils/sanitize';

export async function listGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { status, category, page = '1', limit = '50' } = req.query;

    const filter: Record<string, unknown> = { userId };
    if (status && typeof status === 'string') filter.status = status;
    if (category && typeof category === 'string') filter.category = category;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [goals, total] = await Promise.all([
      Goal.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limitNum).lean(),
      Goal.countDocuments(filter),
    ]);

    res.json({
      goals,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user!.userId }).lean();
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.json({ goal });
  } catch (error) {
    next(error);
  }
}

export async function createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const data = {
      ...req.body,
      userId,
      title: sanitizeString(req.body.title),
      description: sanitizeString(req.body.description || ''),
    };

    const goal = await Goal.create(data);

    await ActivityLog.create({
      userId,
      action: 'created',
      entityType: 'goal',
      entityId: goal._id,
      metadata: { title: goal.title },
    });

    res.status(201).json({ goal });
  } catch (error) {
    next(error);
  }
}

export async function updateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const updates = { ...req.body };

    if (updates.title) updates.title = sanitizeString(updates.title);
    if (updates.description) updates.description = sanitizeString(updates.description);

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    await ActivityLog.create({
      userId,
      action: 'updated',
      entityType: 'goal',
      entityId: goal._id,
      metadata: { fields: Object.keys(updates) },
    });

    res.json({ goal });
  } catch (error) {
    next(error);
  }
}

export async function deleteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    await ActivityLog.create({
      userId,
      action: 'deleted',
      entityType: 'goal',
      entityId: goal._id,
      metadata: { title: goal.title },
    });

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
}

export async function updateGoalStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { status } = req.body;

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId },
      {
        $set: {
          status,
          ...(status === 'completed' ? { completionPercentage: 100 } : {}),
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    await ActivityLog.create({
      userId,
      action: 'status-changed',
      entityType: 'goal',
      entityId: goal._id,
      metadata: { newStatus: status },
    });

    res.json({ goal });
  } catch (error) {
    next(error);
  }
}
