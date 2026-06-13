import { Request, Response, NextFunction } from 'express';
import { Goal } from '../models/Goal.model';
import { Task } from '../models/Task.model';
import { Project } from '../models/Project.model';
import { ActivityLog } from '../models/ActivityLog.model';

export async function getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    const [goals, tasks, projects, recentActivity] = await Promise.all([
      Goal.find({ userId }).lean(),
      Task.find({ userId }).lean(),
      Project.find({ userId }).lean(),
      ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    const goalStats = {
      total: goals.length,
      planned: goals.filter((g) => g.status === 'planned').length,
      active: goals.filter((g) => g.status === 'active').length,
      completed: goals.filter((g) => g.status === 'completed').length,
      blocked: goals.filter((g) => g.status === 'blocked').length,
      averageCompletion: goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + g.completionPercentage, 0) / goals.length)
        : 0,
    };

    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      completionRate: tasks.length > 0
        ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
        : 0,
    };

    const projectStats = {
      total: projects.length,
      active: projects.filter((p) => p.status === 'active').length,
      completed: projects.filter((p) => p.status === 'completed').length,
    };

    // Group goals by category for breakdown
    const categoryBreakdown = goals.reduce<Record<string, { total: number; completed: number }>>((acc, g) => {
      if (!acc[g.category]) acc[g.category] = { total: 0, completed: 0 };
      acc[g.category].total++;
      if (g.status === 'completed') acc[g.category].completed++;
      return acc;
    }, {});

    res.json({
      goals: goalStats,
      tasks: taskStats,
      projects: projectStats,
      categoryBreakdown,
      recentActivity: recentActivity.map((a) => ({
        action: a.action,
        entityType: a.entityType,
        metadata: a.metadata,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}
