import { Request, Response, NextFunction } from 'express';
import { processBrainDump } from '../services/ai/brain-dump.service';
import { classifyEisenhower } from '../services/ai/eisenhower.service';
import { detectConflicts } from '../services/ai/conflict.service';
import { extractFromYouTube } from '../services/ai/youtube.service';
import { generateWeeklyPlan } from '../services/ai/weekly.service';
import { AIAnalysis } from '../models/AIAnalysis.model';
import { Goal } from '../models/Goal.model';
import { Task } from '../models/Task.model';
import { User } from '../models/User.model';
import { Roadmap } from '../models/Roadmap.model';

export async function brainDump(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { text } = req.body;
    const result = await processBrainDump(userId, text);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function approveBrainDump(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { analysisId } = req.body;

    const analysis = await AIAnalysis.findOne({ _id: analysisId, userId, type: 'brain-dump' });
    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }

    if (analysis.userApproved) {
      res.status(400).json({ error: 'Analysis already approved' });
      return;
    }

    const parsed = analysis.parsedOutput as {
      objectives: Array<{
        title: string;
        description: string;
        category: string;
        priority: string;
        estimatedHours: number;
        deadline: string;
        suggestedTasks: Array<{ title: string; estimatedHours: number; order: number }>;
      }>;
    };

    const createdGoals = [];
    let offsetX = 100;

    for (const obj of parsed.objectives) {
      const goal = await Goal.create({
        userId,
        title: obj.title,
        description: obj.description,
        category: obj.category,
        priority: obj.priority,
        estimatedHours: obj.estimatedHours,
        deadline: obj.deadline || null,
        sourceType: 'brain-dump',
        sourceId: analysisId,
        canvasPosition: { x: offsetX, y: 200 },
      });

      // Create tasks for this goal
      for (const taskData of obj.suggestedTasks) {
        await Task.create({
          userId,
          goalId: goal._id,
          title: taskData.title,
          estimatedHours: taskData.estimatedHours,
          order: taskData.order,
          canvasPosition: { x: offsetX, y: 400 + taskData.order * 120 },
        });
      }

      createdGoals.push(goal);
      offsetX += 350;
    }

    analysis.userApproved = true;
    analysis.validationStatus = 'validated';
    await analysis.save();

    res.json({ message: 'Goals created', goalCount: createdGoals.length });
  } catch (error) {
    next(error);
  }
}

export async function eisenhower(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const [goals, user] = await Promise.all([
      Goal.find({ userId, status: { $in: ['planned', 'active'] } }),
      User.findById(userId),
    ]);

    if (goals.length === 0) {
      res.status(400).json({ error: 'No active goals to classify' });
      return;
    }

    const corrections = user?.eisenhowerCorrections || [];
    const result = await classifyEisenhower(userId, goals, corrections);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function detectConflictsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await User.findById(userId);
    const workHours = user?.preferences?.workHoursPerDay || 6;
    const conflicts = await detectConflicts(userId, workHours);
    res.json({ conflicts, count: conflicts.length });
  } catch (error) {
    next(error);
  }
}

export async function youtubeExtract(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { url } = req.body;
    const result = await extractFromYouTube(userId, url);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function approveYouTube(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { analysisId } = req.body;

    const analysis = await AIAnalysis.findOne({ _id: analysisId, userId, type: 'youtube-extraction' });
    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }

    if (analysis.userApproved) {
      res.status(400).json({ error: 'Already approved' });
      return;
    }

    const parsed = analysis.parsedOutput as {
      videoTitle: string;
      steps: Array<{ order: number; title: string; description: string; estimatedHours: number }>;
    };

    // Create a parent goal for the roadmap
    const parentGoal = await Goal.create({
      userId,
      title: parsed.videoTitle,
      description: `Learning roadmap extracted from YouTube`,
      category: 'academic',
      sourceType: 'youtube',
      sourceId: analysisId,
      canvasPosition: { x: 100, y: 100 },
    });

    const roadmapSteps = [];
    for (const step of parsed.steps) {
      const task = await Task.create({
        userId,
        goalId: parentGoal._id,
        title: step.title,
        description: step.description,
        estimatedHours: step.estimatedHours,
        order: step.order,
        canvasPosition: { x: 100 + step.order * 250, y: 300 },
      });
      roadmapSteps.push({ ...step, nodeId: task._id });
    }

    await Roadmap.create({
      userId,
      youtubeUrl: analysis.inputText,
      videoTitle: parsed.videoTitle,
      steps: roadmapSteps,
      aiAnalysisId: analysis._id,
    });

    analysis.userApproved = true;
    analysis.validationStatus = 'validated';
    await analysis.save();

    res.json({ message: 'Roadmap created', goalId: parentGoal._id });
  } catch (error) {
    next(error);
  }
}

export async function weeklyPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await User.findById(userId);
    const workHours = user?.preferences?.workHoursPerDay || 6;
    const result = await generateWeeklyPlan(userId, workHours);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
