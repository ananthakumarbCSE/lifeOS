import { z } from 'zod';

export const brainDumpSchema = z.object({
  text: z.string().min(10, 'Please provide at least 10 characters').max(5000),
});

export const youtubeExtractSchema = z.object({
  url: z.string().url('Valid YouTube URL is required').refine(
    (url) => {
      const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/;
      return pattern.test(url);
    },
    { message: 'Must be a valid YouTube URL' }
  ),
});

export const approveAnalysisSchema = z.object({
  analysisId: z.string().min(1, 'Analysis ID is required'),
});

export type BrainDumpInput = z.infer<typeof brainDumpSchema>;
export type YouTubeExtractInput = z.infer<typeof youtubeExtractSchema>;
