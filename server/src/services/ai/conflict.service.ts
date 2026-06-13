import { generateStructuredOutput } from './gemini.client';
import { conflictResponseSchema } from './schemas/conflict.schema';
import { Goal, IGoal } from '../../models/Goal.model';
import { Event, IEvent } from '../../models/Event.model';
import { Conflict } from '../../models/Conflict.model';
import { AIAnalysis } from '../../models/AIAnalysis.model';
import { logger } from '../../utils/logger';

export interface DetectedConflict {
  type: 'deadline-overlap' | 'workload-excess' | 'unrealistic-schedule';
  severity: 'warning' | 'critical';
  description: string;
  involvedGoalIds: string[];
  suggestion: string;
}

export async function detectConflicts(
  userId: string,
  workHoursPerDay: number
): Promise<DetectedConflict[]> {
  const [goals, events] = await Promise.all([
    Goal.find({ userId, status: { $in: ['planned', 'active'] } }).lean() as unknown as IGoal[],
    Event.find({ userId }).lean() as unknown as IEvent[],
  ]);

  // Phase 1: Deterministic conflict detection
  const deterministicConflicts = detectDeterministicConflicts(goals, events, workHoursPerDay);

  // Phase 2: AI-powered nuanced analysis (only if there are goals to analyze)
  let aiConflicts: DetectedConflict[] = [];
  if (goals.length >= 2) {
    aiConflicts = await detectAIConflicts(userId, goals, events);
  }

  // Merge and deduplicate
  const allConflicts = [...deterministicConflicts, ...aiConflicts];
  const uniqueConflicts = deduplicateConflicts(allConflicts);

  // Clear old unresolved conflicts for this user and create new ones
  await Conflict.deleteMany({ userId, resolved: false });

  for (const conflict of uniqueConflicts) {
    await Conflict.create({
      userId,
      type: conflict.type,
      severity: conflict.severity,
      description: conflict.description,
      involvedNodeIds: conflict.involvedGoalIds,
      involvedNodeTypes: conflict.involvedGoalIds.map(() => 'goal'),
      suggestion: conflict.suggestion,
      canvasPosition: { x: 0, y: 0 }, // Will be positioned by frontend
    });
  }

  return uniqueConflicts;
}

function detectDeterministicConflicts(
  goals: IGoal[],
  _events: IEvent[],
  workHoursPerDay: number
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  // Check deadline overlaps
  const goalsWithDeadlines = goals.filter((g) => g.deadline);
  for (let i = 0; i < goalsWithDeadlines.length; i++) {
    for (let j = i + 1; j < goalsWithDeadlines.length; j++) {
      const a = goalsWithDeadlines[i];
      const b = goalsWithDeadlines[j];
      const diffMs = Math.abs(a.deadline!.getTime() - b.deadline!.getTime());
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 48 && a.estimatedHours + b.estimatedHours > 16) {
        conflicts.push({
          type: 'deadline-overlap',
          severity: 'critical',
          description: `"${a.title}" and "${b.title}" have deadlines within 48 hours of each other, with a combined estimated effort of ${a.estimatedHours + b.estimatedHours} hours.`,
          involvedGoalIds: [a._id.toString(), b._id.toString()],
          suggestion: `Consider starting one of these earlier or negotiating a deadline extension.`,
        });
      }
    }
  }

  // Check weekly workload
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const urgentGoals = goalsWithDeadlines.filter(
    (g) => g.deadline! >= now && g.deadline! <= nextWeek
  );

  const totalUrgentHours = urgentGoals.reduce((sum, g) => sum + g.estimatedHours, 0);
  const availableHours = workHoursPerDay * 7;

  if (totalUrgentHours > availableHours) {
    conflicts.push({
      type: 'workload-excess',
      severity: 'critical',
      description: `You have ${totalUrgentHours} hours of work due this week, but only ~${availableHours} productive hours available (${workHoursPerDay}h/day).`,
      involvedGoalIds: urgentGoals.map((g) => g._id.toString()),
      suggestion: `Prioritize the most important ${Math.ceil(availableHours / 4)} tasks and defer or delegate the rest.`,
    });
  }

  return conflicts;
}

async function detectAIConflicts(
  userId: string,
  goals: IGoal[],
  events: IEvent[]
): Promise<DetectedConflict[]> {
  const goalsData = goals.map((g) => ({
    id: g._id.toString(),
    title: g.title,
    category: g.category,
    deadline: g.deadline?.toISOString() || 'no deadline',
    estimatedHours: g.estimatedHours,
    status: g.status,
    priority: g.priority,
  }));

  const eventsData = events.map((e) => ({
    title: e.title,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
  }));

  const prompt = `Analyze these goals and events for scheduling conflicts, unrealistic timelines, and cognitive overload patterns.

Focus ONLY on genuine conflicts. Do NOT generate warnings for normal workloads.

Goals:
${JSON.stringify(goalsData, null, 2)}

Events:
${JSON.stringify(eventsData, null, 2)}

Look for:
1. Tasks that would mentally interfere with each other (e.g., interview prep + hackathon in same week)
2. Goals with unrealistic time estimates for their scope
3. Missing dependencies that should exist`;

  try {
    const response = await generateStructuredOutput({
      prompt,
      systemInstruction: 'You are a project planning analyst. Identify only GENUINE conflicts and scheduling issues. Do not create false alarms.',
      responseSchema: conflictResponseSchema,
    });

    if (!response.parsed) return [];

    const parsed = response.parsed as { conflicts: DetectedConflict[] };

    await AIAnalysis.create({
      userId,
      type: 'conflict-detection',
      inputText: JSON.stringify({ goals: goalsData, events: eventsData }),
      rawOutput: response.text,
      parsedOutput: parsed,
      validationStatus: 'validated',
      userApproved: true,
      tokenUsage: response.tokenUsage,
    });

    return parsed.conflicts;
  } catch (error) {
    logger.error('AI conflict detection failed:', error);
    return [];
  }
}

function deduplicateConflicts(conflicts: DetectedConflict[]): DetectedConflict[] {
  const seen = new Set<string>();
  return conflicts.filter((c) => {
    const key = `${c.type}-${c.involvedGoalIds.sort().join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
