export const eisenhowerResponseSchema = {
  type: 'object' as const,
  properties: {
    classifications: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          goalId: { type: 'string' as const, description: 'The ID of the goal being classified' },
          quadrant: {
            type: 'string' as const,
            enum: ['urgent-important', 'important-not-urgent', 'urgent-not-important', 'neither'],
          },
          reasoning: { type: 'string' as const, description: 'Brief explanation for this classification' },
        },
        required: ['goalId', 'quadrant', 'reasoning'],
      },
    },
  },
  required: ['classifications'],
};
