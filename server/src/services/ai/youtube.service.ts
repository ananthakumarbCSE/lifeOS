import { generateStructuredOutput } from './gemini.client';
import { youtubeRoadmapSchema } from './schemas/youtube.schema';
import { AIAnalysis } from '../../models/AIAnalysis.model';
import { logger } from '../../utils/logger';

export interface RoadmapStep {
  order: number;
  title: string;
  description: string;
  estimatedHours: number;
}

export interface YouTubeExtractionResult {
  analysisId: string;
  videoTitle: string;
  summary: string;
  steps: RoadmapStep[];
}

export async function extractFromYouTube(
  userId: string,
  url: string
): Promise<YouTubeExtractionResult> {
  // Step 1: Fetch transcript
  const transcript = await fetchTranscript(url);

  // Step 2: Process through AI
  const prompt = `Analyze this YouTube video transcript and create a structured learning roadmap.

Extract the key concepts and topics covered, and organize them into a logical learning sequence.

For each step:
- Give it a clear, concise title
- Describe what the learner should focus on
- Estimate realistic learning/practice time (not just video watching time)
- Order them from foundational to advanced

Transcript:
"""
${transcript.substring(0, 8000)}
"""`;

  const response = await generateStructuredOutput({
    prompt,
    systemInstruction: 'You are an expert educational content analyzer. Create actionable learning roadmaps from video content. Be realistic with time estimates — include practice time, not just video watching.',
    responseSchema: youtubeRoadmapSchema,
  });

  if (!response.parsed) {
    logger.error('YouTube extraction parsing failed');
    throw new Error('Failed to extract content from video. Please try again.');
  }

  const parsed = response.parsed as {
    videoTitle: string;
    summary: string;
    steps: RoadmapStep[];
  };

  const analysis = await AIAnalysis.create({
    userId,
    type: 'youtube-extraction',
    inputText: url,
    rawOutput: response.text,
    parsedOutput: parsed,
    validationStatus: 'pending',
    tokenUsage: response.tokenUsage,
  });

  return {
    analysisId: analysis._id.toString(),
    videoTitle: parsed.videoTitle,
    summary: parsed.summary,
    steps: parsed.steps,
  };
}

async function fetchTranscript(url: string): Promise<string> {
  try {
    // Dynamic import for ESM module
    const { fetchTranscript: getTranscript } = await import('youtube-transcript-plus');
    const segments = await getTranscript(url);

    if (!segments || segments.length === 0) {
      throw new Error('No transcript available for this video');
    }

    // Combine segments into plain text
    return segments
      .map((s: { text: string }) => s.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    logger.error('Failed to fetch YouTube transcript:', error);
    throw new Error(
      'Could not retrieve video transcript. The video may not have captions available.'
    );
  }
}
