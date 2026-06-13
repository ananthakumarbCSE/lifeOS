export const conflictResponseSchema = {
  type: 'object' as const,
  properties: {
    conflicts: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          type: {
            type: 'string' as const,
            enum: ['deadline-overlap', 'workload-excess', 'unrealistic-schedule'],
          },
          severity: {
            type: 'string' as const,
            enum: ['warning', 'critical'],
          },
          description: {
            type: 'string' as const,
            description: 'Human-readable explanation of the conflict',
          },
          involvedGoalIds: {
            type: 'array' as const,
            items: { type: 'string' as const },
          },
          suggestion: {
            type: 'string' as const,
            description: 'Actionable suggestion to resolve the conflict',
          },
        },
        required: ['type', 'severity', 'description', 'involvedGoalIds', 'suggestion'],
      },
    },
  },
  required: ['conflicts'],
};
