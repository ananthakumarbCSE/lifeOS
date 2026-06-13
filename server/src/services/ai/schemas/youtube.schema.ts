export const youtubeRoadmapSchema = {
  type: 'object' as const,
  properties: {
    videoTitle: { type: 'string' as const },
    summary: { type: 'string' as const, description: 'Brief summary of the video content' },
    steps: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          order: { type: 'integer' as const },
          title: { type: 'string' as const, description: 'Concise name for this learning step' },
          description: { type: 'string' as const, description: 'What this step covers and what to learn' },
          estimatedHours: { type: 'number' as const, description: 'Estimated hours to learn/practice this topic' },
        },
        required: ['order', 'title', 'description', 'estimatedHours'],
      },
    },
  },
  required: ['videoTitle', 'summary', 'steps'],
};
