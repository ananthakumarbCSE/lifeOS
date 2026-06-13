export const brainDumpResponseSchema = {
  type: 'object' as const,
  properties: {
    objectives: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          title: { type: 'string' as const, description: 'Concise title for the objective' },
          description: { type: 'string' as const, description: 'Brief description of what this involves' },
          category: {
            type: 'string' as const,
            enum: ['career', 'academic', 'personal', 'project', 'event', 'health', 'finance'],
          },
          priority: {
            type: 'string' as const,
            enum: ['critical', 'high', 'medium', 'low'],
          },
          estimatedHours: { type: 'number' as const, description: 'Estimated total hours to complete' },
          deadline: { type: 'string' as const, description: 'ISO 8601 date string if mentioned, or empty string if not' },
          suggestedTasks: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                title: { type: 'string' as const },
                estimatedHours: { type: 'number' as const },
                order: { type: 'integer' as const },
              },
              required: ['title', 'estimatedHours', 'order'],
            },
          },
        },
        required: ['title', 'description', 'category', 'priority', 'estimatedHours', 'deadline', 'suggestedTasks'],
      },
    },
  },
  required: ['objectives'],
};
