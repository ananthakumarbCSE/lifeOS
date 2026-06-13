import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project.model';
import { ActivityLog } from '../models/ActivityLog.model';
import { sanitizeString } from '../utils/sanitize';

export async function listProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const projects = await Project.find({ userId: req.user!.userId })
      .sort({ updatedAt: -1 }).lean();
    res.json({ projects });
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const project = await Project.create({
      ...req.body,
      userId,
      title: sanitizeString(req.body.title),
      description: sanitizeString(req.body.description || ''),
    });

    await ActivityLog.create({
      userId, action: 'created', entityType: 'project',
      entityId: project._id, metadata: { title: project.title },
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updates = { ...req.body };
    if (updates.title) updates.title = sanitizeString(updates.title);
    if (updates.description) updates.description = sanitizeString(updates.description);

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
    res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
}
