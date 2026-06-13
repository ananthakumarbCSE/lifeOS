import { GoogleGenAI } from '@google/genai';
import { getEnv } from '../../config/environment';
import { logger } from '../../utils/logger';

let aiClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!aiClient) {
    const { GEMINI_API_KEY } = getEnv();
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return aiClient;
}

export interface GeminiRequest {
  prompt: string;
  systemInstruction?: string;
  responseSchema?: Record<string, unknown>;
}

export interface GeminiResponse {
  text: string;
  parsed: Record<string, unknown> | null;
  tokenUsage: { input: number; output: number };
}

export async function generateStructuredOutput(request: GeminiRequest): Promise<GeminiResponse> {
  const client = getClient();
  const { GEMINI_MODEL } = getEnv();

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: request.prompt,
      config: {
        systemInstruction: request.systemInstruction || 'You are a helpful productivity and planning assistant.',
        responseMimeType: request.responseSchema ? 'application/json' : 'text/plain',
        responseSchema: request.responseSchema,
      },
    });

    const text = response.text || '';
    let parsed: Record<string, unknown> | null = null;

    if (request.responseSchema) {
      try {
        parsed = JSON.parse(text);
      } catch (parseError) {
        logger.error('Failed to parse Gemini JSON response:', parseError);
        logger.debug('Raw response:', text);
      }
    }

    const tokenUsage = {
      input: response.usageMetadata?.promptTokenCount || 0,
      output: response.usageMetadata?.candidatesTokenCount || 0,
    };

    return { text, parsed, tokenUsage };
  } catch (error) {
    logger.error('Gemini API call failed:', error);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
}
