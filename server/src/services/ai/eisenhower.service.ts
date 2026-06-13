import { generateStructuredOutput } from './gemini.client';
import { eisenhowerResponseSchema } from './schemas/eisenhower.schema';
import { AIAnalysis } from '../../models/AIAnalysis.model';
import { IGoal } from '../../models/Goal.model';
import { IEisenhowerCorrection } from '../../models/User.model';
import { logger } from '../../utils/logger';

export interface EisenhowerClassification {
  goalId: string;
  quadrant: string;
  reasoning: string;
}

export interface EisenhowerResult {
  analysisId: string;
  classifications: EisenhowerClassification[];
}

export async function classifyEisenhower(
  userId: string,
  goals: IGoal[],
  previousCorrections: IEisenhowerCorrection[]
): Promise<EisenhowerResult> {
  const goalsDescription = goals.map((g) => ({
    id: g._id.toString(),
    title: g.title,
    description: g.description,
    category: g.category,
    deadline: g.deadline ? g.deadline.toISOString() : 'no deadline',
    estimatedHours: g.estimatedHours,
    currentPriority: g.priority,
  }));

  let correctionContext = '';
  if (previousCorrections.length > 0) {
    correctionContext = `\n\nIMPORTANT: The user has previously corrected AI classifications. Learn from these patterns:\n${previousCorrections.slice(-10).map((c) =>
      `- A goal was moved from "${c.originalQuadrant}" to "${c.correctedQuadrant}"`
    ).join('\n')}`;
  }

  const prompt = `Classify the following goals into Eisenhower Matrix quadrants based on their urgency and importance.

Quadrants:
- urgent-important: Deadlines within 1 week, critical tasks, high-stakes items
- important-not-urgent: Long-term goals, skill building, strategic planning
- urgent-not-important: Routine deadlines, delegatable tasks
- neither: Low-value activities, distractions

Consider: deadlines, estimated effort, category, and described importance.
${correctionContext}

Goals to classify:
${JSON.stringify(goalsDescription, null, 2)}`;

  const response = await generateStructuredOutput({
    prompt,
    systemInstruction: 'You are a productivity expert specializing in the Eisenhower Decision Matrix. Provide thoughtful, justified classifications.',
    responseSchema: eisenhowerResponseSchema,
  });

  if (!response.parsed) {
    logger.error('Eisenhower classification parsing failed');
    throw new Error('Failed to classify goals. Please try again.');
  }

  const parsed = response.parsed as { classifications: EisenhowerClassification[] };

  const analysis = await AIAnalysis.create({
    userId,
    type: 'eisenhower',
    inputText: JSON.stringify(goalsDescription),
    rawOutput: response.text,
    parsedOutput: parsed,
    validationStatus: 'pending',
    tokenUsage: response.tokenUsage,
  });

  return {
    analysisId: analysis._id.toString(),
    classifications: parsed.classifications,
  };
}
