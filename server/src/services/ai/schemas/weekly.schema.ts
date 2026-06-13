export const weeklyPlanSchema = {
  type: 'object' as const,
  properties: {
    weekStart: { type: 'string' as const, description: 'ISO date of the week start' },
    days: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          dayName: { type: 'string' as const, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
          date: { type: 'string' as const },
          sessions: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                goalId: { type: 'string' as const },
                goalTitle: { type: 'string' as const },
                taskTitle: { type: 'string' as const },
                durationHours: { type: 'number' as const },
                timeSlot: { type: 'string' as const, enum: ['morning', 'afternoon', 'evening'] },
              },
              required: ['goalId', 'goalTitle', 'taskTitle', 'durationHours', 'timeSlot'],
            },
          },
          totalHours: { type: 'number' as const },
        },
        required: ['dayName', 'date', 'sessions', 'totalHours'],
      },
    },
    totalWeekHours: { type: 'number' as const },
    notes: { type: 'string' as const, description: 'Any scheduling notes or recommendations' },
  },
  required: ['weekStart', 'days', 'totalWeekHours', 'notes'],
};
