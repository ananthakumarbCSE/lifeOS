import { Request, Response, NextFunction } from 'express';
import { Goal } from '../models/Goal.model';
import { Task } from '../models/Task.model';
import { Project } from '../models/Project.model';
import { Event } from '../models/Event.model';
import { Connection } from '../models/Connection.model';
import { Conflict } from '../models/Conflict.model';

interface CanvasNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  style?: Record<string, unknown>;
}

export async function getCanvasData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    const [goals, tasks, projects, events, connections, conflicts] = await Promise.all([
      Goal.find({ userId }).lean(),
      Task.find({ userId }).lean(),
      Project.find({ userId }).lean(),
      Event.find({ userId }).lean(),
      Connection.find({ userId }).lean(),
      Conflict.find({ userId, resolved: false }).lean(),
    ]);

    // Transform to React Flow format
    const nodes: CanvasNode[] = [
      ...goals.map((g) => ({
        id: `goal-${g._id}`,
        type: 'goalNode',
        position: g.canvasPosition,
        data: {
          entityId: g._id,
          title: g.title,
          description: g.description,
          category: g.category,
          priority: g.priority,
          status: g.status,
          eisenhowerQuadrant: g.eisenhowerQuadrant,
          deadline: g.deadline,
          estimatedHours: g.estimatedHours,
          completionPercentage: g.completionPercentage,
          tags: g.tags,
        },
      })),
      ...tasks.map((t) => ({
        id: `task-${t._id}`,
        type: 'taskNode',
        position: t.canvasPosition,
        data: {
          entityId: t._id,
          goalId: t.goalId,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          estimatedHours: t.estimatedHours,
          deadline: t.deadline,
        },
      })),
      ...projects.map((p) => ({
        id: `project-${p._id}`,
        type: 'projectNode',
        position: p.canvasPosition,
        data: {
          entityId: p._id,
          title: p.title,
          description: p.description,
          status: p.status,
          goalCount: p.goalIds.length,
          deadline: p.deadline,
        },
      })),
      ...events.map((e) => ({
        id: `event-${e._id}`,
        type: 'eventNode',
        position: e.canvasPosition,
        data: {
          entityId: e._id,
          title: e.title,
          description: e.description,
          startDate: e.startDate,
          endDate: e.endDate,
        },
      })),
      ...conflicts.map((c) => ({
        id: `warning-${c._id}`,
        type: 'warningNode',
        position: c.canvasPosition,
        data: {
          entityId: c._id,
          type: c.type,
          severity: c.severity,
          description: c.description,
          suggestion: c.suggestion,
          involvedNodeIds: c.involvedNodeIds,
        },
      })),
    ];

    const edges = connections.map((c) => ({
      id: `edge-${c._id}`,
      source: `${c.sourceType}-${c.sourceId}`,
      target: `${c.targetType}-${c.targetId}`,
      type: c.relationshipType,
      data: {
        entityId: c._id,
        relationshipType: c.relationshipType,
        label: c.label,
      },
    }));

    res.json({ nodes, edges });
  } catch (error) {
    next(error);
  }
}

export async function batchUpdatePositions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { updates } = req.body as {
      updates: Array<{ nodeId: string; type: string; position: { x: number; y: number } }>;
    };

    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({ error: 'Updates array is required' });
      return;
    }

    // Limit batch size
    if (updates.length > 200) {
      res.status(400).json({ error: 'Maximum 200 position updates per batch' });
      return;
    }

    const operations = updates.map((u) => {
      const modelMap: Record<string, typeof Goal> = {
        goal: Goal,
        task: Task as unknown as typeof Goal,
        project: Project as unknown as typeof Goal,
        event: Event as unknown as typeof Goal,
      };

      const Model = modelMap[u.type];
      if (!Model) return null;

      return Model.updateOne(
        { _id: u.nodeId, userId },
        { $set: { canvasPosition: u.position } }
      );
    }).filter(Boolean);

    await Promise.all(operations);

    res.json({ message: 'Positions updated', count: operations.length });
  } catch (error) {
    next(error);
  }
}

export async function createConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const connection = await Connection.create({ ...req.body, userId });
    res.status(201).json({ connection });
  } catch (error) {
    next(error);
  }
}

export async function deleteConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const connection = await Connection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    if (!connection) {
      res.status(404).json({ error: 'Connection not found' });
      return;
    }
    res.json({ message: 'Connection deleted' });
  } catch (error) {
    next(error);
  }
}
