import { generateStructuredOutput } from './gemini.client';
import { weeklyPlanSchema } from './schemas/weekly.schema';
import { Goal } from '../../models/Goal.model';
import { Task } from '../../models/Task.model';
import { Event } from '../../models/Event.model';
import { AIAnalysis } from '../../models/AIAnalysis.model';
import { logger } from '../../utils/logger';

export interface WeeklySession {
  goalId: string;
  goalTitle: string;
  taskTitle: string;
  durationHours: number;
  timeSlot: 'morning' | 'afternoon' | 'evening';
}

export interface WeeklyDay {
  dayName: string;
  date: string;
  sessions: WeeklySession[];
  totalHours: number;
}

export interface WeeklyPlanResult {
  analysisId: string;
  weekStart: string;
  days: WeeklyDay[];
  totalWeekHours: number;
  notes: string;
}

export async function generateWeeklyPlan(
  userId: string,
  workHoursPerDay: number
): Promise<WeeklyPlanResult> {
  const [goals, tasks, events] = await Promise.all([
    Goal.find({ userId, status: { $in: ['planned', 'active'] } }).lean(),
    Task.find({ userId, status: { $in: ['planned', 'active'] } }).lean(),
    Event.find({ userId, startDate: { $gte: new Date() } }).lean(),
  ]);

  const goalsData = goals.map((g) => ({
    id: g._id.toString(),
    title: g.title,
    priority: g.priority,
    deadline: g.deadline?.toISOString() || 'no deadline',
    estimatedHoursRemaining: g.estimatedHours * (1 - g.completionPercentage / 100),
    status: g.status,
  }));

  const tasksData = tasks.map((t) => ({
    id: t._id.toString(),
    goalId: t.goalId.toString(),
    title: t.title,
    priority: t.priority,
    estimatedHours: t.estimatedHours,
  }));

  const eventsData = events.map((e) => ({
    title: e.title,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
  }));

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday

  const prompt = `Create a realistic weekly plan starting from ${weekStart.toISOString().split('T')[0]}.

Constraints:
- Maximum ${workHoursPerDay} productive hours per day
- Sessions should be 1-3 hours each (focused work blocks)
- Maximum 2-3 sessions per day
- Prioritize goals with upcoming deadlines
- Leave buffer time for unexpected tasks
- Weekend sessions should be lighter (if any)
- Do NOT schedule conflicting items at the same time

Active goals (prioritize by deadline and priority):
${JSON.stringify(goalsData, null, 2)}

Available tasks:
${JSON.stringify(tasksData, null, 2)}

Scheduled events to work around:
${JSON.stringify(eventsData, null, 2)}`;

  const response = await generateStructuredOutput({
    prompt,
    systemInstruction: `You are a realistic schedule planner. Create practical, achievable weekly plans. Never allocate more than ${workHoursPerDay} hours per day. Prefer 2-3 focused sessions rather than one long stretch.`,
    responseSchema: weeklyPlanSchema,
  });

  if (!response.parsed) {
    logger.error('Weekly plan parsing failed');
    throw new Error('Failed to generate weekly plan. Please try again.');
  }

  const parsed = response.parsed as {
    weekStart: string;
    days: WeeklyDay[];
    totalWeekHours: number;
    notes: string;
  };

  // Validate no day exceeds workHoursPerDay
  for (const day of parsed.days) {
    if (day.totalHours > workHoursPerDay) {
      day.sessions = day.sessions.slice(0, Math.ceil(workHoursPerDay / 2));
      day.totalHours = day.sessions.reduce((sum, s) => sum + s.durationHours, 0);
    }
  }

  const analysis = await AIAnalysis.create({
    userId,
    type: 'weekly-plan',
    inputText: JSON.stringify({ goalsData, tasksData, eventsData }),
    rawOutput: response.text,
    parsedOutput: parsed,
    validationStatus: 'validated',
    userApproved: true,
    tokenUsage: response.tokenUsage,
  });

  return {
    analysisId: analysis._id.toString(),
    ...parsed,
  };
}
