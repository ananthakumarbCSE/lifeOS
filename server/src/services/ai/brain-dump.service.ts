import { generateStructuredOutput } from './gemini.client';
import { brainDumpResponseSchema } from './schemas/brain-dump.schema';
import { AIAnalysis } from '../../models/AIAnalysis.model';
import { logger } from '../../utils/logger';

export interface BrainDumpObjective {
  title: string;
  description: string;
  category: string;
  priority: string;
  estimatedHours: number;
  deadline: string;
  suggestedTasks: Array<{
    title: string;
    estimatedHours: number;
    order: number;
  }>;
}

export interface BrainDumpResult {
  analysisId: string;
  objectives: BrainDumpObjective[];
}

export async function processBrainDump(
  userId: string,
  text: string
): Promise<BrainDumpResult> {
  const prompt = `Analyze the following text from a user describing their goals, plans, and tasks. Extract distinct objectives with appropriate categorization, priority assessment, time estimates, and break each into actionable sub-tasks.

Rules:
- Extract ONLY what the user explicitly mentions or strongly implies.
- Do NOT invent goals that are not in the input.
- Deadlines should be ISO 8601 format if mentioned, or empty string if not.
- Estimated hours should be realistic. A "course completion" might be 20-40 hours, a "project" 10-30 hours.
- Priority should be based on urgency and importance cues in the text.
- Each objective should have 2-6 concrete sub-tasks.

User input:
"""
${text}
"""`;

  const response = await generateStructuredOutput({
    prompt,
    systemInstruction: 'You are an expert productivity coach and project planner. Extract structured, actionable objectives from natural language input. Be precise and realistic with time estimates.',
    responseSchema: brainDumpResponseSchema,
  });

  if (!response.parsed) {
    logger.error('Brain dump parsing failed');
    throw new Error('Failed to process input. Please try again.');
  }

  const parsed = response.parsed as { objectives: BrainDumpObjective[] };

  // Store the analysis record
  const analysis = await AIAnalysis.create({
    userId,
    type: 'brain-dump',
    inputText: text,
    rawOutput: response.text,
    parsedOutput: parsed,
    validationStatus: 'pending',
    tokenUsage: response.tokenUsage,
  });

  return {
    analysisId: analysis._id.toString(),
    objectives: parsed.objectives,
  };
}
